import { cookies } from 'next/headers'
import { query } from '@anthropic-ai/claude-agent-sdk'

const VIEW_SYSTEM_PROMPT = `You generate MDX views for Ryan Waits' personal website. Generate clean, well-structured MDX using the available components.

## About Ryan
- Product engineer building developer tools
- Previously at Hiro, helping developers build on Bitcoin

## Work History
- **Hiro** (2021-2024): Product Engineer. Developer tools for Bitcoin.
- **Blockstack** (2019-2021): Senior Engineer. Decentralized apps platform.
- **Startup Co** (2017-2019): Software Engineer. Early stage fintech.

## Open Source Projects
- openpkg - TypeScript API extraction for packages
- doccov - Documentation coverage analysis
- chainhooks-mcp - MCP server for Chainhook integration

## Writings (at /n/[slug])
- /n/2000-to-100 - From 2000 Lines to 100 (deleted 95% of codebase, tool got better)
- /n/features-dont-compose - Features Don't Compose (agents need surfaces, not features)
- /n/new-standard-who-dis - New Standard, Who Dis? (Standard JSON Schema, runtime extraction)
- /n/how-does-this-not-exist - How Does This Not Exist? (TypeScript packages have no OpenAPI equivalent)

## Available MDX Components
- Grid (cols={2|3|4}), Stack (gap="sm|md|lg")
- Card (variant="default|outlined|filled"), Tag (color="default|green|blue|yellow")
- Timeline + TimelineItem (date, title)
- Comparison + ComparisonItem (title, subtitle)
- Stat (label, value), Stats (container)
- Section (title), Divider (label?)
- LinkCard (href, title, description), Link (href)
- Carousel + CarouselItem (horizontal scroll carousel with snap)

## Guidelines
- Use components appropriately for the content type
- Keep views focused and scannable
- Standard markdown (headers, lists, bold) works inside components
- Generate ONLY the MDX markup - no explanations or commentary`

const viewSchema = {
  type: 'object' as const,
  properties: {
    title: { type: 'string' as const, description: 'A concise, descriptive title for the view' },
    mdx: { type: 'string' as const, description: 'The MDX content using available components. No code fences, just raw MDX/JSX.' }
  },
  required: ['title', 'mdx'] as const,
  additionalProperties: false
}

export async function POST(request: Request) {
  const { prompt, history = [] } = await request.json()

  // Build context from history
  let fullPrompt = prompt
  if (history.length > 0) {
    const historyText = history
      .filter((m: { role: string; content: string }) => !m.content.includes('Generating'))
      .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n')
    fullPrompt = `Previous conversation:\n${historyText}\n\nGenerate a view for: ${prompt}`
  }

  // Get or create session ID (shared with chat)
  const cookieStore = await cookies()
  let sessionId = cookieStore.get('agent-session')?.value
  if (!sessionId) {
    sessionId = crypto.randomUUID()
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'generating' })}\n\n`))

        // Run the agent directly using the SDK with structured output
        const agentQuery = query({
          prompt: fullPrompt,
          options: {
            model: 'claude-sonnet-4-20250514',
            systemPrompt: VIEW_SYSTEM_PROMPT,
            maxTurns: 3,
            cwd: process.cwd(),
            allowedTools: [],
            disallowedTools: ['Bash', 'Edit', 'Write', 'Read', 'Glob', 'Grep', 'Task'],
            outputFormat: { type: 'json_schema', schema: viewSchema },
            pathToClaudeCodeExecutable: '/usr/bin/claude',
          },
        })

        let viewSent = false

        for await (const msg of agentQuery) {
          // Structured output comes as StructuredOutput tool_use
          if (msg.type === 'assistant' && msg.message?.content) {
            for (const block of msg.message.content) {
              if (block.type === 'tool_use' && block.name === 'StructuredOutput') {
                const input = block.input as { title?: string; mdx?: string }
                if (input.title && input.mdx) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'view',
                    title: input.title,
                    mdx: input.mdx
                  })}\n\n`))
                  viewSent = true
                }
              }
            }
          }

          if (msg.type === 'result') {
            if (!viewSent) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'error',
                message: 'No view generated'
              })}\n\n`))
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
          }
        }

        controller.close()
      } catch (error) {
        console.error('View generation error:', error)
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'error',
          message: 'View generation failed'
        })}\n\n`))
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
