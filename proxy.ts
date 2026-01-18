import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// In-memory rate limiting (resets on cold start, fine for personal site)
const rateLimit = new Map<string, { count: number; resetTime: number }>()

const WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS = 20 // per window

function getRateLimitInfo(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimit.get(ip)

  // Clean up expired entries periodically
  if (rateLimit.size > 1000) {
    for (const [key, value] of rateLimit.entries()) {
      if (now > value.resetTime) rateLimit.delete(key)
    }
  }

  if (!record || now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_REQUESTS - 1 }
  }

  if (record.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: MAX_REQUESTS - record.count }
}

export function proxy(request: NextRequest) {
  // Only rate limit /api/chat
  if (!request.nextUrl.pathname.startsWith('/api/chat')) {
    return NextResponse.next()
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'

  const { allowed, remaining } = getRateLimitInfo(ip)

  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again in a minute.' },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Remaining': '0',
        }
      }
    )
  }

  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Remaining', String(remaining))
  return response
}

export const config = {
  matcher: '/api/chat/:path*',
}
