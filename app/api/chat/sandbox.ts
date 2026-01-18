import { Sandbox } from '@vercel/sandbox'

// Session storage for sandbox IDs (resets on cold start, which is fine)
export const sandboxSessions = new Map<string, { sandboxId: string; lastUsed: number }>()

// Cleanup old sessions periodically
export function cleanupSessions() {
  const now = Date.now()
  const timeout = 6 * 60 * 1000 // 6 min (slightly longer than sandbox timeout)
  for (const [key, value] of sandboxSessions.entries()) {
    if (now - value.lastUsed > timeout) {
      sandboxSessions.delete(key)
    }
  }
}

// The agent runner script that executes inside the sandbox
export const AGENT_RUNNER_SCRIPT = `
const { query } = require('@anthropic-ai/claude-agent-sdk');

async function run() {
  const config = JSON.parse(process.argv[2]);

  const q = query({
    prompt: config.prompt,
    options: {
      model: 'claude-3-5-haiku-20241022',
      systemPrompt: config.systemPrompt,
      maxTurns: 3,
      cwd: '/vercel/sandbox',
      settingSources: ['project'],
      allowedTools: ['Read', 'Skill'],
      disallowedTools: ['Bash', 'Edit', 'Write', 'Glob', 'Grep', 'Task'],
    },
  });

  for await (const msg of q) {
    console.log(JSON.stringify(msg));
  }
}

run().catch(err => {
  console.error(JSON.stringify({ type: 'error', message: err.message }));
  process.exit(1);
});
`

export async function getOrCreateSandbox(sessionId: string): Promise<Sandbox> {
  cleanupSessions()

  const existing = sandboxSessions.get(sessionId)

  // Try to reconnect to existing sandbox
  if (existing) {
    try {
      const sandbox = await Sandbox.get({
        sandboxId: existing.sandboxId,
        teamId: process.env.VERCEL_TEAM_ID,
        projectId: process.env.VERCEL_PROJECT_ID,
        token: process.env.VERCEL_TOKEN,
      })
      // Check if sandbox is still running
      if (sandbox.status === 'running') {
        sandboxSessions.set(sessionId, { sandboxId: existing.sandboxId, lastUsed: Date.now() })
        console.log(`[Sandbox] Reconnected to ${existing.sandboxId}`)
        return sandbox
      }
      // Sandbox not running, will create new one
      sandboxSessions.delete(sessionId)
      console.log(`[Sandbox] Previous sandbox not running (${sandbox.status}), creating new`)
    } catch {
      // Sandbox expired or error, will create new one
      sandboxSessions.delete(sessionId)
      console.log(`[Sandbox] Previous sandbox expired, creating new`)
    }
  }

  // Create new sandbox with git repo
  console.log(`[Sandbox] Creating new sandbox for session ${sessionId}`)
  const sandbox = await Sandbox.create({
    teamId: process.env.VERCEL_TEAM_ID,
    projectId: process.env.VERCEL_PROJECT_ID,
    token: process.env.VERCEL_TOKEN,
    source: {
      url: 'https://github.com/ryanwaits/site.git',
      type: 'git',
    },
    timeout: 5 * 60 * 1000, // 5 min idle timeout
    runtime: 'node24',
  })

  // Install Claude Code CLI globally
  console.log(`[Sandbox] Installing Claude Code CLI`)
  await sandbox.runCommand({
    cmd: 'npm',
    args: ['install', '-g', '@anthropic-ai/claude-code'],
  })

  // Install project dependencies (includes Agent SDK)
  console.log(`[Sandbox] Installing project dependencies`)
  await sandbox.runCommand({
    cmd: 'npm',
    args: ['install'],
  })

  // Write the agent runner script
  await sandbox.writeFiles([{
    path: '/vercel/sandbox/agent-runner.js',
    content: Buffer.from(AGENT_RUNNER_SCRIPT),
  }])

  sandboxSessions.set(sessionId, { sandboxId: sandbox.sandboxId, lastUsed: Date.now() })
  console.log(`[Sandbox] Created ${sandbox.sandboxId}`)

  return sandbox
}
