'use client'

import { SelectionToolbar } from './components/selection-toolbar'
import { MarkdownRaw } from './components/markdown-raw'
import { SiteNav } from './components/site-nav'
import { SiteFooter } from './components/site-footer'

const MARKDOWN_CONTENT = `---
title: Ryan Waits
description: Designer and engineer exploring what dev tools look like when agents are users
location: Austin, TX
---

# Ryan Waits

I design developer tools. Mostly CLIs, docs systems, and the invisible stuff that makes codebases easier to work with.

Spent three years at [Hiro](https://hiro.so) shaping Bitcoin developer infrastructure — rearchitected their docs system across 12+ packages and 10+ APIs, designed and built the [Chainhooks CLI](https://github.com/hirosystems/chainhooks), and prototyped onboarding flows for their event-streaming platform. All with a team of one, which meant designing for constraints: atomic primitives, automation-first, surfaces that could scale without me.

I was designing for agents before it was obvious. Now it's obvious.

---

## Now

Thinking about what software design means when agents are the user. Should we be building fewer features and more primitives? What does a good API surface look like when the consumer isn't a human skimming docs?

Still figuring it out. Building things to learn:

**[openpkg](https://github.com/ryanwaits/openpkg)** — Extracts the public API from any TypeScript package. JSON Schema out. One command. I wanted OpenAPI for packages — turns out it didn't exist, so I built it.

**[doccov](https://github.com/ryanwaits/doccov)** — Documentation coverage. Started as 2000 lines of TypeScript, now 100 lines of prompts. Deleted 95% of the code. The tool got better. [Wrote about it](/n/2000-to-100).

---

## Thinking

I write when I figure something out:

- **[From 2000 Lines to 100](/n/2000-to-100)** — What happens when you replace code with prompts.
- **[Features Don't Compose](/n/features-dont-compose)** — Why agents need primitives, not features.
- **[How Does This Not Exist?](/n/how-does-this-not-exist)** — The missing standard for TypeScript packages.

---

## How I work

I prototype in code. Mockups are fine but I'd rather build the thing and feel it. Most of my design decisions come from using what I made and noticing what's off.

I obsess over small details — error messages, progress feedback, what information shows when. Developer tools should feel fast and unsurprising.

I delete more than I add. If I can remove a feature and the tool gets simpler without getting worse, I remove it.

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
