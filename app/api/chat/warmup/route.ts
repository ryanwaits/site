import { Sandbox } from '@vercel/sandbox'
import { cookies } from 'next/headers'
import { sandboxSessions, AGENT_RUNNER_SCRIPT } from '../sandbox'

const isDev = !process.env.VERCEL_TOKEN

// Dev mode: simulate warmup with delays
async function devWarmup() {
  const encoder = new TextEncoder()
  const sessionId = crypto.randomUUID()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      // Simulate boot sequence
      send({ stage: 'creating', message: 'Initializing sandbox environment' })
      await new Promise(r => setTimeout(r, 1500))

      send({ stage: 'cloning', message: 'Repository cloned' })
      await new Promise(r => setTimeout(r, 2000))

      send({ stage: 'installing', message: 'Installing dependencies' })
      await new Promise(r => setTimeout(r, 3000))

      send({ stage: 'ready', message: 'Sandbox ready (dev mode)', sandboxId: 'dev-mock' })
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Set-Cookie': `agent-session=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
    },
  })
}

export async function POST() {
  // Use mock in dev mode
  if (isDev) {
    console.log('[Warmup] Dev mode - simulating sandbox boot')
    return devWarmup()
  }

  const encoder = new TextEncoder()

  // Get or create session ID
  const cookieStore = await cookies()
  let sessionId = cookieStore.get('agent-session')?.value
  if (!sessionId) {
    sessionId = crypto.randomUUID()
  }

  // Check if sandbox already exists and is running
  const existing = sandboxSessions.get(sessionId)
  if (existing) {
    try {
      const sandbox = await Sandbox.get({
        sandboxId: existing.sandboxId,
        teamId: process.env.VERCEL_TEAM_ID,
        projectId: process.env.VERCEL_PROJECT_ID,
        token: process.env.VERCEL_TOKEN,
      })
      if (sandbox.status === 'running') {
        sandboxSessions.set(sessionId, { sandboxId: existing.sandboxId, lastUsed: Date.now() })
        return new Response(
          JSON.stringify({ status: 'ready', sandboxId: existing.sandboxId }),
          {
            headers: {
              'Content-Type': 'application/json',
              'Set-Cookie': `agent-session=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
            },
          }
        )
      }
    } catch {
      sandboxSessions.delete(sessionId)
    }
  }

  // Stream progress updates
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        // Stage 1: Creating sandbox
        send({ stage: 'creating', message: 'Initializing sandbox environment' })

        const sandbox = await Sandbox.create({
          teamId: process.env.VERCEL_TEAM_ID,
          projectId: process.env.VERCEL_PROJECT_ID,
          token: process.env.VERCEL_TOKEN,
          source: {
            url: 'https://github.com/ryanwaits/site.git',
            type: 'git',
          },
          timeout: 5 * 60 * 1000,
          runtime: 'node24',
        })

        // Stage 2: Cloning done (implicit), installing CLI
        send({ stage: 'cloning', message: 'Repository cloned' })

        console.log(`[Warmup] Installing Claude Code CLI`)
        await sandbox.runCommand({
          cmd: 'npm',
          args: ['install', '-g', '@anthropic-ai/claude-code'],
        })

        // Stage 3: Installing dependencies
        send({ stage: 'installing', message: 'Installing dependencies' })

        console.log(`[Warmup] Installing project dependencies`)
        await sandbox.runCommand({
          cmd: 'npm',
          args: ['install'],
        })

        // Write agent runner script
        await sandbox.writeFiles([{
          path: '/vercel/sandbox/agent-runner.js',
          content: Buffer.from(AGENT_RUNNER_SCRIPT),
        }])

        // Store session
        sandboxSessions.set(sessionId!, { sandboxId: sandbox.sandboxId, lastUsed: Date.now() })

        // Stage 4: Ready
        send({ stage: 'ready', message: 'Sandbox ready', sandboxId: sandbox.sandboxId })

        console.log(`[Warmup] Sandbox ${sandbox.sandboxId} ready for session ${sessionId}`)

        controller.close()
      } catch (error) {
        console.error('[Warmup] Error:', error)
        send({ stage: 'error', message: 'Failed to initialize sandbox' })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Set-Cookie': `agent-session=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
    },
  })
}
