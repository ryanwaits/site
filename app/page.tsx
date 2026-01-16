'use client'

import { SelectionToolbar } from './components/selection-toolbar'
import { MarkdownRaw } from './components/markdown-raw'
import { SiteNav } from './components/site-nav'
import { SiteFooter } from './components/site-footer'

// Raw markdown content using actual markdown syntax
const MARKDOWN_CONTENT = `# FIELD REPORT RW-2025-001

SUBJECT: Ryan Waits — Product Engineer
LOCATION: Austin, TX
DATE: January 2025
STATUS: Building AI-native developer tooling

---

## Mission Overview

Product engineer specializing in developer tools and AI-native workflows.
Currently focused on the intersection of **documentation** and **machine readability**.
Previously at Hiro building Bitcoin developer infrastructure (2021-2024).

Core belief: The best developer tools disappear. They don't add features — they
remove friction. The agent doesn't need your help. It needs your surfaces.

---

## Current Focus

### Primary Objective

Building tools that make codebases machine-readable. Documentation coverage,
API extraction, type-safe interfaces. The boring infrastructure that makes
AI-native development possible.

### Active Projects

| Codename        | Status | Description                                    |
|-----------------|--------|------------------------------------------------|
| doccov          | MVP    | Documentation coverage analysis                |
|                 |        | Codecov for docs. Measures how well your       |
|                 |        | public APIs are documented.                    |
| openpkg         | Stable | TypeScript API extraction                      |
|                 |        | Extracts public API surface from any           |
|                 |        | TypeScript package. Zero config.               |
| secondlayer-cli | Stable | Clarity contract interfaces                    |
|                 |        | Generate TypeScript types from Bitcoin         |
|                 |        | smart contracts.                               |
| chainhooks-mcp  | Active | MCP server for Chainhook integration           |
|                 |        | Connect AI agents to Bitcoin event streams.    |

---

## Employment History

### Hiro Systems (2021 — 2024)

**Product Engineer** — Developer Tools

Built and maintained developer tooling for Bitcoin ecosystem:

- Clarinet: Local development environment for Clarity smart contracts
- Chainhooks: Event streaming infrastructure for Bitcoin/Stacks
- Documentation platform serving 50k+ monthly developers

### Blockstack PBC (2019 — 2021)

**Senior Engineer** — Platform

Decentralized application platform. Authentication, storage, identity.
Early Bitcoin L2 infrastructure.

### Various Startups (2017 — 2019)

**Software Engineer**

Early-stage fintech. Payments, lending, compliance automation.

---

## Recent Transmissions

### December 2025

- **From 2000 Lines to 100** — Deleted 95% of the codebase. The tool got
  better. Sometimes the best feature is the one you remove.

- **Features Don't Compose** — The agent doesn't need your features — it
  needs your surfaces. Stop building for humans who read docs. Build for
  machines that parse APIs.

- **New Standard, Who Dis?** — Standard Schema shipped. Runtime extraction
  just got universal. One schema format to rule them all.

- **Pick a Standard, Extend Carefully** — Custom formats are a trap.
  Standards are leverage. Every proprietary format is technical debt.

### October 2025

- **Codecov, But for Docs** — Code coverage has tooling. Documentation
  coverage? Nothing. Until now.

- **How Does This Not Exist?** — REST APIs have OpenAPI. GraphQL has
  introspection. TypeScript packages have... nothing.

---

## Operating Principles

1. **Simplicity over flexibility** — Every option is a decision someone
   has to make. Most decisions don't need to be made.

2. **Standards over custom** — Proprietary formats are debt. Standards
   are leverage. Pick the boring choice.

3. **Surfaces over features** — The best API is the one that doesn't
   need documentation. Make the right thing obvious.

4. **Delete over add** — The feature you remove is the feature that
   can't break. Subtraction is underrated.

---

## Contact

| Channel  | Handle                                      |
|----------|---------------------------------------------|
| X        | [@ryan_waits](https://x.com/ryan_waits)     |
| GitHub   | [ryanwaits](https://github.com/ryanwaits)   |
| Location | Austin, TX                                  |
| Agent    | Press \`[A]\` to open communications channel  |

---

## Classification

This document is **UNCLASSIFIED**. Distribution unlimited.
Select any text to explain or discuss with the agent.

---

*END REPORT*`

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
