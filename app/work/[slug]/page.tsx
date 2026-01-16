'use client'

import { useEffect, useRef, useState } from 'react'
import { SiteNav } from '../../components/site-nav'
import { SiteFooter } from '../../components/site-footer'
import { TerminalFrame, getLineColor } from '../../components/terminal-frame'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

// Project data with scrollytelling sections
const PROJECTS: Record<string, {
  name: string
  tagline: string
  status: string
  sections: Array<{
    id: string
    title: string
    content: string
    terminal: {
      command?: string
      output: string[]
      typing?: boolean
    }
  }>
}> = {
  doccov: {
    name: 'doccov',
    tagline: 'Codecov for documentation',
    status: 'MVP',
    sections: [
      {
        id: 'problem',
        title: 'The Problem',
        content: `Code coverage has tooling. Documentation coverage? Nothing.

You ship a library with 50 exports. How many are documented? Which ones are missing @param tags? Nobody knows until a user files an issue.`,
        terminal: {
          output: [
            '// your-package/index.ts',
            '',
            'export function calculate(x, y, opts) {',
            '  // ... 200 lines of logic',
            '}',
            '',
            'export function transform(input) {',
            '  // ... complex transformation',
            '}',
            '',
            '// 48 more exports...',
            '',
            '// Question: How many are documented?',
            '// Answer: ¯\\_(ツ)_/¯',
          ]
        }
      },
      {
        id: 'solution',
        title: 'The Solution',
        content: `doccov scans your TypeScript package and calculates documentation coverage like code coverage.

Every exported function, class, type, and interface. Every parameter and return type. Measured and reported.`,
        terminal: {
          command: 'npx doccov analyze ./src',
          typing: true,
          output: [
            '$ npx doccov analyze ./src',
            '',
            '◐ Scanning exports...',
            '◐ Parsing JSDoc comments...',
            '◐ Calculating coverage...',
          ]
        }
      },
      {
        id: 'output',
        title: 'The Output',
        content: `Get a clear coverage report showing exactly what's documented and what's missing.

Broken down by file. Broken down by export type. Actionable warnings for every gap.`,
        terminal: {
          output: [
            '┌─────────────────────────────────────────┐',
            '│ DOCCOV COVERAGE REPORT                  │',
            '├─────────────────────────────────────────┤',
            '│                                         │',
            '│ Overall:  ████████░░░░░░░░░░░░  42%    │',
            '│                                         │',
            '│ Functions ████████████░░░░░░░░  58%    │',
            '│ Classes   ██████░░░░░░░░░░░░░░  31%    │',
            '│ Types     ████████████████░░░░  78%    │',
            '│ Interfaces████████░░░░░░░░░░░░  45%    │',
            '│                                         │',
            '├─────────────────────────────────────────┤',
            '│ ⚠ 23 exports missing documentation     │',
            '│ ⚠ 12 functions missing @param          │',
            '│ ⚠ 8 functions missing @returns         │',
            '└─────────────────────────────────────────┘',
          ]
        }
      },
      {
        id: 'cicd',
        title: 'CI/CD Integration',
        content: `Add to your pipeline. Fail builds when coverage drops below threshold.

Same workflow as code coverage. Documentation becomes a first-class quality metric.`,
        terminal: {
          output: [
            '# .github/workflows/docs.yml',
            '',
            'name: Documentation Coverage',
            'on: [push, pull_request]',
            '',
            'jobs:',
            '  coverage:',
            '    runs-on: ubuntu-latest',
            '    steps:',
            '      - uses: actions/checkout@v4',
            '      - run: npx doccov analyze ./src',
            '      - run: npx doccov check --min 80',
            '',
            '# ✓ Fails if coverage < 80%',
          ]
        }
      },
      {
        id: 'install',
        title: 'Get Started',
        content: `Zero config. Point at your source directory. Get a report.

Works with any TypeScript project. Extracts JSDoc, TSDoc, and inline comments.`,
        terminal: {
          command: 'npm install -g doccov',
          output: [
            '$ npm install -g doccov',
            '+ doccov@0.3.2',
            '',
            '$ doccov analyze ./src',
            '',
            '✓ Coverage report generated',
            '✓ Found 50 exports',
            '✓ 21 fully documented',
            '✓ 29 need attention',
            '',
            '→ doccov-report.json',
          ]
        }
      }
    ]
  },
  openpkg: {
    name: 'openpkg',
    tagline: 'TypeScript API extraction',
    status: 'Stable',
    sections: [
      {
        id: 'problem',
        title: 'The Problem',
        content: `REST APIs have OpenAPI. GraphQL has introspection. TypeScript packages have... nothing.

You want to know what a package exports? Read the source. Grep through node_modules. Hope the docs are current.`,
        terminal: {
          output: [
            '// How do you know what lodash exports?',
            '',
            '$ cat node_modules/lodash/package.json',
            '// exports field? Maybe. Maybe not.',
            '',
            '$ ls node_modules/lodash/*.js | wc -l',
            '615',
            '',
            '$ grep "export" node_modules/lodash/*.js',
            '// Good luck.',
          ]
        }
      },
      {
        id: 'solution',
        title: 'The Solution',
        content: `openpkg extracts the complete public API surface from any TypeScript package.

Functions, types, interfaces, classes. Parameters, return types, generics. Everything machine-readable.`,
        terminal: {
          command: 'npx openpkg extract lodash',
          typing: true,
          output: [
            '$ npx openpkg extract lodash',
            '',
            '◐ Resolving package...',
            '◐ Loading type definitions...',
            '◐ Extracting public API...',
          ]
        }
      },
      {
        id: 'output',
        title: 'The Output',
        content: `A clean JSON schema describing every public export. Types resolved. Generics expanded. Ready for tooling.

Feed it to an LLM. Generate documentation. Build type-safe wrappers.`,
        terminal: {
          output: [
            '{',
            '  "name": "lodash",',
            '  "version": "4.17.21",',
            '  "exports": {',
            '    "functions": [',
            '      {',
            '        "name": "map",',
            '        "signature": "<T, R>(arr: T[], fn: (v: T) => R) => R[]",',
            '        "params": [',
            '          { "name": "arr", "type": "T[]" },',
            '          { "name": "fn", "type": "(v: T) => R" }',
            '        ],',
            '        "returns": "R[]"',
            '      },',
            '      // ... 311 more functions',
            '    ],',
            '    "types": 48,',
            '    "interfaces": 23',
            '  }',
            '}',
          ]
        }
      },
      {
        id: 'usecase',
        title: 'Use Cases',
        content: `Build AI-powered dev tools. Generate SDK wrappers. Create documentation sites.

Any workflow that needs to understand what a package does—without reading source code.`,
        terminal: {
          output: [
            '// Feed to Claude for code generation',
            '$ openpkg extract zod > zod-api.json',
            '$ cat prompt.txt zod-api.json | claude',
            '',
            '// Generate documentation',
            '$ openpkg extract ./src | docs-gen',
            '',
            '// Type-safe wrapper generation',
            '$ openpkg extract stripe | wrap-gen --lang python',
            '',
            '// Diff between versions',
            '$ openpkg diff lodash@4.17.20 lodash@4.17.21',
          ]
        }
      },
      {
        id: 'install',
        title: 'Get Started',
        content: `Point at any package. Local path or npm registry. Zero config extraction.`,
        terminal: {
          command: 'npm install -g openpkg',
          output: [
            '$ npm install -g openpkg',
            '+ openpkg@1.2.0',
            '',
            '$ openpkg extract react',
            '',
            '✓ Extracted 156 exports',
            '✓ 89 functions',
            '✓ 34 types',
            '✓ 33 interfaces',
            '',
            '→ react-api.json (47kb)',
          ]
        }
      }
    ]
  },
  'chainhooks-mcp': {
    name: 'chainhooks-mcp',
    tagline: 'MCP server for Bitcoin events',
    status: 'Active',
    sections: [
      {
        id: 'problem',
        title: 'The Problem',
        content: `AI agents can't see blockchain events. They're blind to what's happening on Bitcoin and Stacks.

You want Claude to react to a transaction? Build a custom integration. Every time.`,
        terminal: {
          output: [
            '// Current state of AI + blockchain',
            '',
            'User: "Monitor my STX wallet and alert me"',
            '',
            'Claude: "I cannot access blockchain data.',
            '         I have no way to monitor wallets.',
            '         Please use a block explorer."',
            '',
            '// The agent is blind.',
          ]
        }
      },
      {
        id: 'solution',
        title: 'The Solution',
        content: `chainhooks-mcp connects AI agents to Bitcoin event streams via the Model Context Protocol.

Real-time transaction data. Smart contract events. Wallet activity. All accessible to any MCP-compatible agent.`,
        terminal: {
          command: 'chainhooks-mcp start',
          typing: true,
          output: [
            '$ chainhooks-mcp start',
            '',
            '◐ Connecting to Chainhooks service...',
            '◐ Registering MCP server...',
            '◐ Exposing blockchain tools...',
          ]
        }
      },
      {
        id: 'streaming',
        title: 'Live Streaming',
        content: `Events flow in real-time. STX transfers. Contract calls. NFT mints.

The agent sees it as it happens. Reacts, analyzes, alerts.`,
        terminal: {
          output: [
            '┌─ CHAINHOOKS STREAM ──────────────────────┐',
            '│ ● CONNECTED stacks-mainnet              │',
            '├──────────────────────────────────────────┤',
            '│ 18:04:22 STX_TRANSFER                   │',
            '│          0.5 STX → SP2J6...3KV          │',
            '│                                          │',
            '│ 18:04:19 CONTRACT_CALL                  │',
            '│          alex-v2.swap-helper            │',
            '│          fn: swap-stx-for-token         │',
            '│                                          │',
            '│ 18:04:15 NFT_MINT                       │',
            '│          megapont-ape-club #4521        │',
            '│                                          │',
            '│          ↓ streaming...                 │',
            '└──────────────────────────────────────────┘',
          ]
        }
      },
      {
        id: 'tools',
        title: 'Agent Tools',
        content: `Exposes tools the agent can call. Query balances. Decode transactions. Set up event filters.

Standard MCP interface. Works with Claude Desktop, Cursor, any MCP client.`,
        terminal: {
          output: [
            '// Tools exposed to the agent',
            '',
            'tools: [',
            '  {',
            '    name: "get_stx_balance",',
            '    params: { address: "string" }',
            '  },',
            '  {',
            '    name: "subscribe_to_address",',
            '    params: { address: "string", events: "string[]" }',
            '  },',
            '  {',
            '    name: "decode_transaction",',
            '    params: { txid: "string" }',
            '  },',
            '  {',
            '    name: "query_contract_state",',
            '    params: { contract: "string", key: "string" }',
            '  }',
            ']',
          ]
        }
      },
      {
        id: 'install',
        title: 'Get Started',
        content: `Add to your MCP config. The agent gains blockchain vision.`,
        terminal: {
          output: [
            '// claude_desktop_config.json',
            '',
            '{',
            '  "mcpServers": {',
            '    "chainhooks": {',
            '      "command": "npx",',
            '      "args": ["chainhooks-mcp"],',
            '      "env": {',
            '        "CHAINHOOKS_API_KEY": "..."',
            '      }',
            '    }',
            '  }',
            '}',
            '',
            '// Restart Claude Desktop',
            '// Agent now has blockchain tools',
          ]
        }
      }
    ]
  }
}

// Terminal component with typing animation
function Terminal({ data, isActive }: {
  data: { command?: string; output: string[]; typing?: boolean }
  isActive: boolean
}) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([])
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (!isActive) {
      setDisplayedLines([])
      return
    }

    if (data.typing) {
      setIsTyping(true)
      setDisplayedLines([])

      // Animate lines appearing one by one
      data.output.forEach((line, i) => {
        setTimeout(() => {
          setDisplayedLines(prev => [...prev, line])
          if (i === data.output.length - 1) {
            setIsTyping(false)
          }
        }, i * 150)
      })
    } else {
      setDisplayedLines(data.output)
    }
  }, [isActive, data])

  return (
    <TerminalFrame title="terminal">
      {/* Terminal content */}
      <div className="p-4 min-h-[300px] max-h-[400px] overflow-y-auto font-mono text-xs">
        <AnimatePresence mode="wait">
          <motion.div
            key={data.output.join('')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {displayedLines.map((line, i) => (
              <motion.div
                key={i}
                initial={data.typing ? { opacity: 0, x: -10 } : { opacity: 1 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className={`leading-relaxed ${getLineColor(line)}`}
              >
                {line || '\u00A0'}
              </motion.div>
            ))}
            {isTyping && (
              <span className="inline-block w-2 h-4 bg-[var(--console-accent)] animate-pulse" />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </TerminalFrame>
  )
}

export default function ProjectPage() {
  const params = useParams()
  const slug = params.slug as string
  const project = PROJECTS[slug]

  const [activeSection, setActiveSection] = useState(0)
  const [showStickyHeader, setShowStickyHeader] = useState(false)
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])
  const headerRef = useRef<HTMLDivElement>(null)

  // Track header visibility for sticky header
  useEffect(() => {
    if (!headerRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyHeader(!entry.isIntersecting)
      },
      { threshold: 0 }
    )

    observer.observe(headerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!project) return

    const observers = sectionRefs.current.map((ref, index) => {
      if (!ref) return null

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(index)
          }
        },
        {
          rootMargin: '-40% 0px -40% 0px',
          threshold: 0
        }
      )

      observer.observe(ref)
      return observer
    })

    return () => {
      observers.forEach(observer => observer?.disconnect())
    }
  }, [project])

  if (!project) {
    return (
      <div className="h-screen flex flex-col bg-[var(--color-bg)]">
        <SiteNav />
        <main className="flex-1 flex items-center justify-center">
          <p className="font-mono text-[var(--color-muted)]">Project not found</p>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[var(--color-bg)]">
      <SiteNav />

      {/* Compact sticky header - appears when main header scrolls out */}
      {showStickyHeader && (
        <div className="fixed top-[49px] left-0 right-0 z-40 bg-[var(--color-bg)] border-y border-[var(--color-border)] px-6 py-3">
          <div className="max-w-6xl mx-auto md:ml-[72px] flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[var(--color-text)] text-[var(--color-bg)]">
              {project.status}
            </span>
            <h1 className="font-mono text-sm text-[var(--color-text)]">
              {project.name}
            </h1>
            <span className="text-[var(--color-muted)]">—</span>
            <p className="font-mono text-xs text-[var(--color-muted)]">
              {project.tagline}
            </p>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto">
        {/* Main header */}
        <div ref={headerRef} className="border-b border-[var(--color-border)] px-6 py-8">
          <div className="max-w-6xl mx-auto md:ml-[72px]">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[var(--color-text)] text-[var(--color-bg)]">
                {project.status}
              </span>
            </div>
            <h1 className="font-mono text-2xl text-[var(--color-text)] mb-1">
              {project.name}
            </h1>
            <p className="font-mono text-sm text-[var(--color-muted)]">
              {project.tagline}
            </p>
          </div>
        </div>

        {/* Scrollytelling content */}
        <div className="max-w-6xl mx-auto md:ml-[72px] px-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 relative">

            {/* Left: Narrative sections */}
            <div className="py-12 space-y-32">
              {project.sections.map((section, i) => (
                <div
                  key={section.id}
                  ref={el => { sectionRefs.current[i] = el }}
                  className={`transition-opacity duration-300 ${
                    activeSection === i ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-mono text-[10px] text-[var(--color-muted)]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[var(--color-muted)]">/</span>
                    <h2 className="font-mono text-xs uppercase tracking-wider text-[var(--color-text)]">
                      {section.title}
                    </h2>
                  </div>
                  <div className="font-mono text-sm leading-relaxed text-[var(--color-text)] whitespace-pre-line">
                    {section.content}
                  </div>

                  {/* Mobile: Show terminal inline */}
                  <div className="lg:hidden mt-6">
                    <Terminal data={section.terminal} isActive={true} />
                  </div>
                </div>
              ))}

              {/* Spacer for last section */}
              <div className="h-[40vh]" />
            </div>

            {/* Right: Sticky terminal */}
            <div className="hidden lg:block">
              <div className="sticky top-8 py-12">
                <Terminal
                  data={project.sections[activeSection]?.terminal || project.sections[0].terminal}
                  isActive={true}
                />

                {/* Section indicators */}
                <div className="flex gap-1 mt-4 justify-center">
                  {project.sections.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        sectionRefs.current[i]?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center'
                        })
                      }}
                      className={`w-8 h-1 transition-colors ${
                        activeSection === i
                          ? 'bg-[var(--color-text)]'
                          : 'bg-[var(--color-border)]'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
