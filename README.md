# site

- **Framework**: [Next.js](https://nextjs.org/)
- **Deployment**: [Vercel](https://vercel.com)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Analytics**: [Vercel Analytics](https://vercel.com/analytics)

## Running Locally

```bash
git clone https://github.com/ryanwaits/site.git
cd site
bun install
bun dev
```

## Agent Console Architecture

The site includes an AI agent console (press `A` to toggle) powered by the Claude Agent SDK.

### Current Setup: Vercel Serverless + Sandbox

The Agent SDK requires Claude Code CLI installed. Vercel's serverless functions are stateless and can't install global packages, so we use [Vercel Sandbox](https://vercel.com/docs/sandbox) as a workaround:

```
Browser
    ↓
Next.js API Route (serverless)
    ↓
Vercel Sandbox (container with Claude Code CLI)
    ↓
agent-runner.js calls Agent SDK query()
    ↓
Streams JSON to stdout → parsed by API route → SSE to browser
```

**Key files:**
- `app/api/chat/route.ts` - Main chat endpoint
- `app/api/chat/sandbox.ts` - Sandbox creation/reuse logic
- `app/api/chat/warmup/route.ts` - Pre-warms sandbox when console opens
- `app/components/sandbox-boot.tsx` - ASCII boot animation during cold start

**Tradeoffs:**
- Cold start: ~10-15s when sandbox needs to boot
- Session reuse: Sandbox persists for 5 min idle, reused via cookies
- Complexity: agent-runner.js glue needed since sandbox API is command-based

**Required env vars (Vercel dashboard):**
```
ANTHROPIC_API_KEY=sk-ant-...
VERCEL_TOKEN=...
VERCEL_TEAM_ID=...
VERCEL_PROJECT_ID=...
```

### Alternative: Non-Serverless Deployment

To eliminate the sandbox complexity and cold starts, deploy to a traditional server (Fly.io, Railway, Render, etc.):

```bash
# On the server
npm install -g @anthropic-ai/claude-code
next build && next start
```

Then simplify the API route to call the SDK directly:

```ts
// app/api/chat/route.ts (simplified)
import { query } from '@anthropic-ai/claude-agent-sdk'

export async function POST(req: Request) {
  const { message } = await req.json()

  const stream = new ReadableStream({
    async start(controller) {
      const q = query({
        prompt: message,
        options: {
          model: 'claude-sonnet-4-20250514',
          systemPrompt: SYSTEM_PROMPT,
          maxTurns: 3,
          allowedTools: ['Read', 'Skill'],
        },
      })

      for await (const msg of q) {
        controller.enqueue(`data: ${JSON.stringify(msg)}\n\n`)
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' },
  })
}
```

**Files to delete if switching:**
- `app/api/chat/sandbox.ts`
- `app/api/chat/warmup/route.ts`
- `app/components/sandbox-boot.tsx`

**Tradeoffs:**
| | Vercel + Sandbox | Traditional Server |
|---|---|---|
| Cold start | ~10-15s | None |
| Ops | Zero | Some (deploys, scaling) |
| Cost | Per request + sandbox | Per uptime (~$5/mo) |
| Complexity | Higher | Lower |

## License

1. You are free to use this code as inspiration.
2. Please do not copy it directly.
3. Crediting the author is appreciated.
