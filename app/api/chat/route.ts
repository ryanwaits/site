import { query, HookCallback, PreToolUseHookInput } from '@anthropic-ai/claude-agent-sdk'
import path from 'path'
import fs from 'fs/promises'
import { posts } from '@/app/n/posts'

// Security hook: restrict file reads to project directory only
const restrictFileAccess: HookCallback = async (input) => {
  if (input.hook_event_name !== 'PreToolUse') return {}

  const preInput = input as PreToolUseHookInput
  if (preInput.tool_name !== 'Read') return {}

  const toolInput = preInput.tool_input as Record<string, unknown>
  const filePath = toolInput?.file_path as string
  if (!filePath) return {}

  const projectRoot = process.cwd()
  const resolved = path.resolve(filePath)

  // Block access outside project directory
  if (!resolved.startsWith(projectRoot)) {
    console.log(`[SECURITY] Blocked read outside project: ${filePath}`)
    return {
      hookSpecificOutput: {
        hookEventName: input.hook_event_name,
        permissionDecision: 'deny',
        permissionDecisionReason: `Access denied: cannot read files outside project directory`
      }
    }
  }

  // Also block .env files
  if (resolved.endsWith('.env') || resolved.includes('.env.')) {
    console.log(`[SECURITY] Blocked read of env file: ${filePath}`)
    return {
      hookSpecificOutput: {
        hookEventName: input.hook_event_name,
        permissionDecision: 'deny',
        permissionDecisionReason: `Access denied: cannot read environment files`
      }
    }
  }

  return {}
}

// Read post content by slug
async function getPostContent(slug: string): Promise<string | null> {
  const post = posts.find(p => p.slug === slug)
  if (!post) return null

  try {
    const filePath = path.join(process.cwd(), 'app', 'n', slug, 'page.mdx')
    const content = await fs.readFile(filePath, 'utf-8')
    return content
  } catch {
    return null
  }
}

const SYSTEM_PROMPT = `You are an AI assistant embedded in Ryan Waits' personal website console. This is a terminal-style interface - respond accordingly.

## About Ryan
- Product engineer building developer tools
- Previously at Hiro building Bitcoin developer tools
- Writes about DX, DevRel, Rust tooling, product engineering, AI

## Work History
- **Hiro** (2020-2024): Building Bitcoin developer tools. Stacks blockchain infrastructure.

## Open Source Projects
- openpkg - TypeScript API extraction
- doccov - Documentation coverage tool
- chainhooks-mcp - MCP server for Chainhooks

## Writings (at /n/[slug])
- /n/dx - On Developer Experience
- /n/developer-marketing - On Developer Marketing
- /n/devrel - On Developer Relations
- /n/devtools - On Developer Products
- /n/moderation - On Community Moderation
- /n/rust - Rust is Eating JavaScript
- /n/product-engineers - Product Engineers
- /n/stack - My Stack
- /n/ai - Understanding AI

## Response Style (CRITICAL)
You're in a terminal. Respond like CLI output:
- NO emojis ever
- Be terse and direct
- Use markdown but keep it minimal
- Tables: simple, no decorations
- Lists: use - or numbers
- Headers: use ## sparingly
- Code: use backticks

## Site Commands
For theme/effects, output JSON the frontend parses:
\`\`\`json:command
{"action": "theme", "value": "dark"}
\`\`\`
Actions: theme, matrix, confetti

## Tone
- Direct, slightly dry humor okay
- Dev-to-dev energy
- Skip fluff and preamble
`

export async function POST(request: Request) {
  const { message, history = [], mentions = [] } = await request.json()

  // Load content for any @mentions
  let mentionContext = ''
  if (mentions.length > 0) {
    const mentionContents = await Promise.all(
      mentions.map(async (slug: string) => {
        const content = await getPostContent(slug)
        const post = posts.find(p => p.slug === slug)
        if (content && post) {
          return `\n\n---\n## Referenced: "${post.title}" (@${slug})\n\n${content}\n---`
        }
        return null
      })
    )
    mentionContext = mentionContents.filter(Boolean).join('')
  }

  // Build prompt with conversation history for context
  let fullPrompt = message
  if (history.length > 0) {
    const historyText = history
      .filter((m: { role: string; content: string }) => !m.content.includes('Generating custom view'))
      .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n')
    fullPrompt = `Previous conversation:\n${historyText}\n\nCurrent request: ${message}`
  }

  // Append mention context if any
  if (mentionContext) {
    fullPrompt += `\n\nThe user has referenced the following writing(s) for context:${mentionContext}`
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const q = query({
          prompt: fullPrompt,
          options: {
            model: 'claude-sonnet-4-20250514',
            systemPrompt: SYSTEM_PROMPT,
            maxTurns: 3,
            cwd: process.cwd(),
            settingSources: ['project'], // Load project .claude/ only (skills, commands)
            allowedTools: ['Read', 'Skill'], // Enable Read for content access, Skill for project skills
            disallowedTools: ['Bash', 'Edit', 'Write', 'Glob', 'Grep', 'Task'], // Keep dangerous tools disabled
            hooks: {
              PreToolUse: [{ matcher: 'Read', hooks: [restrictFileAccess] }]
            },
          },
        })

        let hasStartedResponse = false

        for await (const msg of q) {
          if (msg.type === 'system' && 'subtype' in msg && msg.subtype === 'init') {
            console.log('Available commands:', (msg as { slash_commands?: string[] }).slash_commands)
            // Signal thinking state starts
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'thinking' })}\n\n`))
          }

          if (msg.type === 'assistant') {
            // Process all content blocks
            for (const block of msg.message.content) {
              if (block.type === 'tool_use') {
                // Stream tool use events
                const toolName = block.name
                const toolInput = block.input as Record<string, unknown>

                let activity: { kind: string; tool: string; detail?: string }

                if (toolName === 'Read') {
                  activity = {
                    kind: 'tool',
                    tool: 'Reading',
                    detail: String(toolInput.file_path || '').replace(process.cwd() + '/', ''),
                  }
                } else if (toolName === 'Skill') {
                  activity = {
                    kind: 'skill',
                    tool: 'Using',
                    detail: String(toolInput.skill || ''),
                  }
                } else {
                  activity = {
                    kind: 'tool',
                    tool: toolName,
                  }
                }

                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'activity', ...activity })}\n\n`))
              }

              if (block.type === 'text' && block.text) {
                if (!hasStartedResponse) {
                  hasStartedResponse = true
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'streaming' })}\n\n`))
                }
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: block.text })}\n\n`))
              }
            }
          }

          if (msg.type === 'result') {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
          }
        }

        controller.close()
      } catch (error) {
        console.error('Chat error:', error)
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: String(error) })}\n\n`))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
