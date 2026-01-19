import { cookies } from 'next/headers'
import { query } from '@anthropic-ai/claude-agent-sdk'
import { getPosts } from '@/content/posts.server'
import fs from 'node:fs/promises'
import path from 'node:path'

// Read post content by slug (for @mentions)
async function getPostContent(slug: string): Promise<string | null> {
  try {
    const filePath = path.join(process.cwd(), 'content', slug, 'index.mdx')
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
- Writes about DX, DevRel, product engineering, AI

## Personal
- Lives in Austin in a geodesic dome with wife (artist/architect - builds brooms, furniture, living spaces) and 2 dogs: Shark (red heeler), Harper (American dingo)
- Former D1 tennis player (Miami, ASU), now plays pickleball
- Plays piano (self-taught via YouTube, got into it through Radiohead/Coldplay/Muse)

## Movies
Eclectic taste. All-time favorites: Back to the Future, The Matrix (got him into computers), Interstellar, Jerry Maguire, Seabiscuit, Cinderella Man. Comedy era: Jim Carrey (Ace Ventura, Dumb and Dumber, Liar Liar), Chris Farley (Tommy Boy, Black Sheep). Randoms he loves: In Bruges, Ex Machina, The Martian, Cast Away, Fifth Element, Maverick, Legend of Bagger Vance.

## Music
All over the place. High school/college: Radiohead, Coldplay, Muse. Heavier: Tool, System of a Down. Hip-hop: huge Eminem phase (performed Rabbit Run at school dance, dyed hair). From mom: Sade, Enya, Enigma. Film scores: Hans Zimmer, Danny Elfman, Max Richter (Leftovers soundtrack). Pop roots: Ace of Base.

## Personality & Values
- Relaxed, go with the flow. Sarcastic with close friends but not mean.
- Strong opinions loosely held. Enjoys healthy debate. Low ego - always learning.
- Chip on shoulder about proving himself in technical/creative work after being naturally athletic.
- Hates buzzwords/BS and process over progress. Ships, doesn't just talk.

## Influences
- John Mackey (Conscious Capitalism) - business with purpose beyond profits
- Alex Epstein (Fossil Future) - changed how he thinks about tradeoffs and weighing positives/negatives
- Classical liberalism: Hayek, Friedman - not hardcore, but influential on worldview

## Podcasts/Learning
All In Pod, AI/tech startup content. Obsessed with pace of industry change. Has a book debt to pay off.

## Work History
- **Hiro** (2020-2024): Building Bitcoin developer tools. Stacks blockchain infrastructure.

## Open Source Projects
- openpkg - TypeScript API extraction
- doccov - Documentation coverage tool
- chainhooks-mcp - MCP server for Chainhooks

## Writings (at /t/[slug])
- /t/how-does-this-not-exist - Why TypeScript needs an OpenAPI-style spec (intro to OpenPKG)
- /t/new-standard-who-dis - Standard JSON Schema and runtime introspection
- /t/features-dont-compose - Agent-native architecture: primitives over features
- /t/2000-to-100 - Deleted 95% of doccov's code, replaced with prompts

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
- Direct, relaxed, dry humor okay
- Dev-to-dev energy
- Skip fluff, buzzwords, and preamble
- Strong opinions loosely held - willing to debate but not preach

## When to Use Skills vs. Answer Directly (IMPORTANT)
You have personal info about Ryan in this system prompt. USE IT FIRST before reaching for skills.
- Questions about hobbies, personal life, music, movies → answer from context above
- Questions about work history, projects → answer from context above
- Only use /work skill if user wants MORE detail than what's in context
- Only use /about skill for formal bio requests
- "outside of work" or "personal life" → use the Personal section above, NOT the /work skill

## Personal Questions (IMPORTANT)
Don't overshare. When asked personal questions:
- Pick 2-3 relevant things, not exhaustive lists
- Be conversational, not encyclopedic
- Save details for follow-ups - let people ask more
- Match the energy of the question (casual q = casual answer)
- "What movies do you like?" → mention 3-4, not every movie you've seen
- "Tell me about yourself" → hit highlights, invite follow-up
`

export async function POST(request: Request) {
  let body: { message?: unknown; history?: unknown; mentions?: unknown }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { message, history = [], mentions = [] } = body

  // Input validation
  if (!message || typeof message !== 'string' || message.length > 4000) {
    return Response.json({ error: 'Invalid message' }, { status: 400 })
  }
  if (!Array.isArray(history) || history.length > 20) {
    return Response.json({ error: 'Invalid history' }, { status: 400 })
  }
  if (!Array.isArray(mentions) || mentions.some(m => typeof m !== 'string' || m.length > 100)) {
    return Response.json({ error: 'Invalid mentions' }, { status: 400 })
  }

  // Get or create session ID
  const cookieStore = await cookies()
  let sessionId = cookieStore.get('agent-session')?.value
  if (!sessionId) {
    sessionId = crypto.randomUUID()
  }

  const posts = await getPosts()

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

  // Build prompt with conversation history
  let fullPrompt = message as string
  if ((history as Array<{ role: string; content: string }>).length > 0) {
    const historyText = (history as Array<{ role: string; content: string }>)
      .filter((m) => !m.content.includes('Generating custom view'))
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n')
    fullPrompt = `Previous conversation:\n${historyText}\n\nCurrent request: ${message}`
  }

  if (mentionContext) {
    fullPrompt += `\n\nThe user has referenced the following writing(s) for context:${mentionContext}`
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Signal thinking state
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'thinking' })}\n\n`))

        // Run the agent directly using the SDK
        const agentQuery = query({
          prompt: fullPrompt,
          options: {
            model: 'claude-3-5-haiku-20241022',
            systemPrompt: SYSTEM_PROMPT,
            maxTurns: 3,
            cwd: process.cwd(),
            settingSources: ['project'],
            allowedTools: ['Read', 'Skill', 'WebFetch'],
            disallowedTools: ['Bash', 'Edit', 'Write', 'Glob', 'Grep', 'Task', 'WebSearch'],
            pathToClaudeCodeExecutable: process.env.CLAUDE_CODE_PATH,
          },
        })

        let hasStartedResponse = false

        for await (const msg of agentQuery) {
          // Tool use - show activity in real-time
          if (msg.type === 'assistant' && msg.message?.content) {
            for (const block of msg.message.content) {
              if (block.type === 'tool_use') {
                const toolName = block.name
                const toolInput = block.input as Record<string, unknown>

                let activity: { kind: string; tool: string; detail?: string }

                if (toolName === 'Read') {
                  activity = {
                    kind: 'tool',
                    tool: 'Reading',
                    detail: path.basename(String(toolInput.file_path || '')),
                  }
                } else if (toolName === 'Skill') {
                  activity = {
                    kind: 'skill',
                    tool: 'Using',
                    detail: String(toolInput.skill || ''),
                  }
                } else if (toolName === 'WebFetch') {
                  const url = String(toolInput.url || '')
                  const hostname = url ? new URL(url).hostname : ''
                  activity = {
                    kind: 'tool',
                    tool: 'Fetching',
                    detail: hostname,
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

        // Ensure we send done if no result was received
        if (!hasStartedResponse) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'No response generated' })}\n\n`))
        }

        controller.close()
      } catch (error) {
        console.error('Chat error:', error)
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Request failed' })}\n\n`))
        controller.close()
      }
    },
  })

  // Set session cookie in response
  const response = new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Set-Cookie': `agent-session=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
    },
  })

  return response
}
