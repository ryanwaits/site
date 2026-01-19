import { cookies } from 'next/headers'

// On a VPS, the server is always ready - no provisioning needed
export async function POST() {
  const cookieStore = await cookies()
  let sessionId = cookieStore.get('agent-session')?.value
  if (!sessionId) {
    sessionId = crypto.randomUUID()
  }

  // Return instant ready response
  return Response.json(
    { status: 'ready' },
    {
      headers: {
        'Set-Cookie': `agent-session=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
      },
    }
  )
}
