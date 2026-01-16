# CLAUDE.md

Be extremely concise. Sacrifice grammar for the sake of concision.

## Commands

```bash
bun dev          # Dev server with Turbopack
bun run build    # Production build
```

## Architecture

Personal site: Next.js 15, React 19, MDX, Tailwind v4.

### Agent Console
- `app/components/console.tsx` — AI chat interface (press `A` to toggle)
- `app/api/chat/route.ts` — Claude Agent SDK streaming endpoint
- `.claude/commands/` — Slash commands (`/about`, `/work`, `/text`, `/read`)
- `.claude/skills/` — Auto-triggered skills (`writings-expert`, `site-navigator`)

### Content Structure
- `app/page.mdx` — Homepage
- `app/work/page.mdx` — Work page
- `app/n/*/page.mdx` — Notes/blog posts (auto-discovered by sitemap.ts)
- MDX files can import React components directly

### Key Files
- `mdx-components.tsx` — Global MDX component overrides (links, code highlighting via sugar-high, typography)
- `app/layout.tsx` — Root layout with Inter font, ViewTransitions, Analytics
- `app/globals.css` — Tailwind v4 config, syntax highlighting vars (--sh-*), view transition animations
- `next.config.ts` — MDX setup, Postgres redirects (optional)

### Patterns
- View transitions via `next-view-transitions` — `.transition-element` class triggers named transitions
- Code syntax highlighting uses sugar-high with Tokyo Night-style colors
- Internal links use `next-view-transitions` Link, external links open in new tab
- Postgres redirects loaded at build time (requires POSTGRES_URL env var)

### TypeScript
- `app/n/ai/*.tsx` excluded from type checking (tsconfig.json)
- Path alias: `@/*` → project root
