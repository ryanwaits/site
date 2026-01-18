'use client'

import { SelectionToolbar } from './components/selection-toolbar'
import { MarkdownRaw } from './components/markdown-raw'
import { SiteNav } from './components/site-nav'
import { SiteFooter } from './components/site-footer'

const MARKDOWN_CONTENT = `---
title: Ryan Waits
description: Product engineer building AI-native developer tools
location: Austin, TX
---

# Ryan Waits

Product engineer. Building tools that make codebases machine-readable.

Previously at [Hiro](https://hiro.so) building Bitcoin developer infrastructure (2020-2024).
Now focused on the intersection of documentation and machine readability.

---

## Now

Building primitives for AI-native development. The agent doesn't need your
features — it needs your surfaces.

**[openpkg](https://github.com/ryanwaits/openpkg)** — TypeScript API extraction.
One command, structured JSON Schema output. OpenAPI for packages.

**[doccov](https://github.com/ryanwaits/doccov)** — Documentation coverage.
Codecov for docs. Started as 2000 lines of TypeScript, now 100 lines of prompts.

**[chainhooks-mcp](https://github.com/ryanwaits/chainhooks-mcp)** — MCP server
for Bitcoin event streams. Connect agents to on-chain data.

---

## Writing

**[From 2000 Lines to 100](/n/2000-to-100)** — Deleted 95% of doccov. Replaced
code with prompts. The tool got better.

**[Features Don't Compose](/n/features-dont-compose)** — The agent doesn't need
features. It needs primitives. Build surfaces, not workflows.

**[New Standard, Who Dis?](/n/new-standard-who-dis)** — Standard JSON Schema
shipped. Runtime extraction just got universal.

**[How Does This Not Exist?](/n/how-does-this-not-exist)** — REST has OpenAPI.
GraphQL has introspection. TypeScript packages have... nothing. Until now.

---

## Principles

1. **Simplicity over flexibility** — Every option is a decision. Most don't
   need to be made.

2. **Standards over custom** — Proprietary formats are debt. Standards are
   leverage.

3. **Surfaces over features** — The best API doesn't need documentation.
   Make the right thing obvious.

4. **Delete over add** — The feature you remove can't break.

---

## Contact

[@ryan_waits](https://x.com/ryan_waits) · [GitHub](https://github.com/ryanwaits)

Press \`A\` to chat with the agent.`

export default function HomePage() {
  return (
    <div className="h-screen flex flex-col bg-[var(--color-bg)]">
      <SelectionToolbar />
      <SiteNav />
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-3xl md:ml-[72px]">
          <MarkdownRaw
            content={MARKDOWN_CONTENT}
            className="text-[var(--color-text)]"
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
