'use client'

import { useEffect, useRef, useState } from 'react'
import { SiteNav } from '../../components/site-nav'
import { TerminalFrame } from '../../components/terminal-frame'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { highlight } from 'sugar-high'

// Project data with scrollytelling sections
const PROJECTS: Record<string, {
  name: string
  tagline: string
  status: string
  github: string
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
  drift: {
    name: 'drift',
    tagline: 'Your code changed. Your docs didn\'t.',
    status: 'Stable',
    github: 'https://github.com/ryanwaits/drift',
    sections: [
      {
        id: 'problem',
        title: 'The Problem',
        content: `Your code changed. Your docs didn't.

JSDoc says one param, function takes three. @example blocks reference APIs you removed last sprint. Markdown docs import exports that no longer exist. Nobody knows until a user files an issue.`,
        terminal: {
          output: [
            '/** @param x - the first number */',
            'export function calculate(x, y, opts) {',
            '  // JSDoc: 1 param. Code: 3 params.',
            '}',
            '',
            '/** @example',
            ' * transform(input, { mode: "fast" })',
            ' * // \'mode\' option was removed in v2',
            ' */',
            'export function transform(input) { }',
          ]
        }
      },
      {
        id: 'solution',
        title: 'The Solution',
        content: `21 commands. Two surfaces, one engine — composed commands for humans, primitives for agents.

15 drift types across 4 categories: structural (JSDoc vs code), semantic (deprecation, broken links), example (code errors), and prose (stale markdown references).`,
        terminal: {
          command: 'drift scan',
          typing: true,
          output: [
            '$ drift scan',
            '',
            '◐ Extracting API spec...',
            '◐ Checking coverage...',
            '◐ Cross-referencing JSDoc vs code...',
            '◐ Validating examples...',
            '◐ Scanning prose for stale refs...',
          ]
        }
      },
      {
        id: 'output',
        title: 'The Output',
        content: `All commands output {ok, data, meta} JSON to stdout. Every drift issue includes filePath and line — agents read the diagnosis, then edit code directly.

Detection is the tool's job. Mutation is the agent's job.`,
        terminal: {
          output: [
            'DRIFT SCAN',
            '',
            'Coverage:   ████████░░░░░░░░░░░░  42%',
            '',
            'structural  7 issues  (param mismatch, type drift)',
            'semantic    3 issues  (broken @link, deprecation)',
            'example     4 issues  (typecheck failures)',
            'prose       1 issue   (stale markdown import)',
            '',
            '15 drift issues found',
            'Each with filePath + line for agent fixes',
          ]
        }
      },
      {
        id: 'agent',
        title: 'Agent Usage',
        content: `Ships as a Claude Code skill. Install it, then /drift inside any TypeScript project. The CLI outputs structured JSON with location data — agents use it to fix your docs automatically.

Every primitive is individually addressable. scan is a convenience, not a gate.`,
        terminal: {
          output: [
            '/drift              # status check, auto-init',
            '/drift fix          # lint → fix JSDoc signatures',
            '/drift enrich       # coverage → add missing JSDoc',
            '/drift review       # PR documentation impact',
            '/drift release      # pre-release audit',
            '/drift docs/        # scan external docs for stale refs',
            '',
            '# Machine-readable command discovery',
            '$ drift --capabilities',
          ]
        }
      },
      {
        id: 'install',
        title: 'Get Started',
        content: `Entry auto-detects from package.json. Just drift scan in any TypeScript project. Compose primitives in CI or let agents use them directly.`,
        terminal: {
          command: 'drift scan',
          output: [
            '# Full scan',
            '$ drift scan',
            '',
            '# Or compose primitives',
            '$ drift coverage --min 80',
            '$ drift lint',
            '$ drift examples',
            '',
            '# CI (GitHub Actions)',
            '- uses: driftdev/drift@v1',
            '  with:',
            '    min-coverage: 80',
          ]
        }
      }
    ]
  },
  secondlayer: {
    name: 'secondlayer',
    tagline: 'Developer infrastructure for Stacks',
    status: 'Stable',
    github: 'https://github.com/ryanwaits/secondlayer',
    sections: [
      {
        id: 'problem',
        title: 'The Problem',
        content: `Stacks has no cohesive dev toolkit. Contract calls are untyped string bags. Want to index events? Build your own. Want to query chain state with SQL? Not a thing.

You're gluing together 5 different libraries with no shared type system. Hope the types align.`,
        terminal: {
          output: [
            '// Stacks development today',
            '',
            'await contractCall({',
            '  contractAddress: "SP2...",',
            '  contractName: "my-contract",',
            '  functionName: "transfer",',
            '  functionArgs: [',
            '    uintCV(100),      // amount? recipient?',
            '    principalCV(to),  // is this right?',
            '  ]',
            '})',
            '',
            '// No autocomplete. No type safety.',
            '// Indexing? Roll your own.',
          ]
        }
      },
      {
        id: 'stacks',
        title: 'Stacks Client',
        content: `@secondlayer/stacks — viem-style typed client for Stacks. Public, wallet, and multisig clients with composable actions. HTTP, WebSocket, and fallback transports. Local and provider accounts.

Chain definitions for mainnet, testnet, devnet. Address validation, STX formatting, BNS, PoX, subscriptions.`,
        terminal: {
          output: [
            'import { createPublicClient, http } from',
            '  "@secondlayer/stacks"',
            '',
            'const client = createPublicClient({',
            '  chain: mainnet,',
            '  transport: http(),',
            '})',
            '',
            '// Typed actions',
            'const block = await client.getBlock()',
            'const info = await client.getInfo()',
            '',
            '// WebSocket subscriptions',
            '// Wallet + multisig clients',
            '// BNS, PoX, StackingDAO',
          ]
        }
      },
      {
        id: 'indexer',
        title: 'Indexer & Views',
        content: `@secondlayer/indexer consumes Stacks node events. Parses blocks, transactions, contract events. Detects reorganizations, validates parent hashes, auto-backfills gaps.

@secondlayer/views lets you define SQL views on indexed chain data. Define a schema, deploy it, query it.`,
        terminal: {
          output: [
            '// Define a view on indexed data',
            'import { defineView } from "@secondlayer/views"',
            '',
            'const tokenTransfers = defineView({',
            '  name: "token_transfers",',
            '  columns: {',
            '    sender: { type: "text" },',
            '    amount: { type: "numeric" },',
            '    block:  { type: "integer" },',
            '  },',
            '})',
            '',
            '// Deploy, diff, reindex',
            'await deploySchema(schema)',
            'await diffSchema(old, new)',
          ]
        }
      },
      {
        id: 'codegen',
        title: 'Contract Codegen',
        content: `@secondlayer/cli generates type-safe interfaces from Clarity contracts. Point at a local file or deployed contract — network inferred from address prefix.

Config-driven with plugins: clarinet(), actions(), react(), testing().`,
        terminal: {
          output: [
            '// Read-only',
            'const balance = await token.read.getBalance({',
            '  account: "SP..."',
            '})',
            '',
            '// Write',
            'await token.write.transfer({',
            '  amount: 100n, recipient: "SP..."',
            '})',
            '',
            '// Contract state',
            'await token.maps.balances.get("SP...")',
            'await token.vars.totalSupply.get()',
            'await token.constants.maxSupply.get()',
          ]
        }
      },
      {
        id: 'packages',
        title: '10 Packages',
        content: `Everything published under @secondlayer. Use what you need — the stacks client, the indexer, the codegen CLI, or the full stack.`,
        terminal: {
          output: [
            'packages/',
            '  stacks/        # viem-style typed client',
            '  indexer/        # event indexer + reorg detection',
            '  views/          # SQL views on chain data',
            '  cli/            # contract codegen',
            '  sdk/            # streams query client',
            '  clarity-docs/   # Clarity doc standard',
            '  shared/         # DB, queues, logging',
            '  api/            # Hono REST layer',
            '  auth/           # auth middleware',
            '  worker/         # background processing',
          ]
        }
      }
    ]
  },
  'openpkg-ts': {
    name: 'openpkg-ts',
    tagline: 'OpenAPI for TypeScript packages',
    status: 'Stable',
    github: 'https://github.com/ryanwaits/openpkg-ts',
    sections: [
      {
        id: 'problem',
        title: 'The Problem',
        content: `REST APIs have OpenAPI. GraphQL has introspection. TypeScript packages have... nothing.

You want to know what a package exports? Read the source. Grep through node_modules. Hope the docs are current. This seemed like an obvious gap, so I built it.`,
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

Functions, types, interfaces, classes. Parameters, return types, generics. JSON Schema out — ready for agents, tooling, whatever needs to understand your API.`,
        terminal: {
          command: 'npx @openpkg-ts/cli snapshot src/index.ts',
          typing: true,
          output: [
            '$ npx @openpkg-ts/cli snapshot src/index.ts',
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
            '      { "name": "map", "params": ["arr", "fn"], "returns": "R[]" },',
            '      { "name": "filter", "params": ["arr", "pred"], "returns": "T[]" },',
            '      // ... 309 more',
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

The whole point: agents need to understand your API surface in one pass. Not skim docs. Not grep source. Just structured JSON they can reason about.`,
        terminal: {
          output: [
            '// Extract full spec',
            '$ openpkg snapshot src/index.ts -o openpkg.json',
            '',
            '// Generate docs from spec',
            '$ openpkg docs openpkg.json -o api.md',
            '',
            '// Diff between versions',
            '$ openpkg diff old.json new.json --summary',
            '',
            '// Pipeline',
            '$ openpkg snapshot src/index.ts -o - | openpkg docs -',
          ]
        }
      },
      {
        id: 'install',
        title: 'Get Started',
        content: `Point at any package. Local path or npm registry. One command, JSON Schema out. No config, no setup, just the API surface.`,
        terminal: {
          command: 'npm install -g @openpkg-ts/cli',
          output: [
            '$ npm install -g @openpkg-ts/cli',
            '+ @openpkg-ts/cli@1.0.0',
            '',
            '$ openpkg snapshot src/index.ts',
            '',
            '✓ Extracted 156 exports',
            '✓ 89 functions',
            '✓ 34 types',
            '✓ 33 interfaces',
            '',
            '→ openpkg.json (47kb)',
          ]
        }
      }
    ]
  },
}

// Order of projects for navigation (matches lib/projects.ts)
const PROJECT_ORDER = ['openpkg-ts', 'drift', 'secondlayer']

// Terminal component with typing animation and syntax highlighting
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

  // Highlight all content as a single block for better syntax highlighting
  const fullCode = displayedLines.join('\n')
  const highlightedHtml = highlight(fullCode)

  return (
    <TerminalFrame title="terminal">
      {/* Terminal content */}
      <div className="p-4 min-h-[300px] max-h-[400px] overflow-y-auto font-mono text-[13px] leading-[1.7]">
        <AnimatePresence mode="wait">
          <motion.div
            key={data.output.join('')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <pre className="m-0 p-0 bg-transparent">
              <code
                className="text-[var(--console-text)]"
                dangerouslySetInnerHTML={{ __html: highlightedHtml || '\u00A0' }}
              />
            </pre>
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
  const router = useRouter()
  const slug = params.slug as string
  const project = PROJECTS[slug]

  // Navigation between projects
  const currentIndex = PROJECT_ORDER.indexOf(slug)
  const prevSlug = currentIndex > 0 ? PROJECT_ORDER[currentIndex - 1] : null
  const nextSlug = currentIndex < PROJECT_ORDER.length - 1 ? PROJECT_ORDER[currentIndex + 1] : null
  const prevProject = prevSlug ? PROJECTS[prevSlug] : null
  const nextProject = nextSlug ? PROJECTS[nextSlug] : null

  const [activeSection, setActiveSection] = useState(0)
  const [showStickyHeader, setShowStickyHeader] = useState(false)
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])
  const headerRef = useRef<HTMLDivElement>(null)

  // Keyboard navigation between projects
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

      if (e.key === 'ArrowLeft' && prevSlug) {
        router.push(`/work/${prevSlug}`)
      } else if (e.key === 'ArrowRight' && nextSlug) {
        router.push(`/work/${nextSlug}`)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router, prevSlug, nextSlug])

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
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-[var(--color-text)] hover:underline"
            >
              {project.name}
            </a>
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
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-2xl text-[var(--color-text)] hover:underline"
            >
              {project.name}
            </a>
            <p className="font-mono text-sm text-[var(--color-muted)]">
              {project.tagline}
            </p>
          </div>
        </div>

        {/* Scrollytelling content */}
        <div className="md:ml-[72px] px-6 lg:pr-[72px]">
          <div className="lg:grid lg:grid-cols-[minmax(0,540px)_1fr] lg:gap-16 xl:gap-24 relative">

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

      {/* Footer with project navigation */}
      <footer className="flex-shrink-0 border-t border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="max-w-6xl mx-auto md:ml-[72px] px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Prev */}
            {prevProject ? (
              <Link
                href={`/work/${prevSlug}`}
                className="group flex items-center gap-2 font-mono text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                <span className="opacity-50">←</span>
                <span>{prevProject.name}</span>
              </Link>
            ) : (
              <div />
            )}

            {/* Next */}
            {nextProject ? (
              <Link
                href={`/work/${nextSlug}`}
                className="group flex items-center gap-2 font-mono text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                <span>{nextProject.name}</span>
                <span className="opacity-50">→</span>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
