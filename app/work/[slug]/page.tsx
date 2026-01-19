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
  doccov: {
    name: 'doccov',
    tagline: 'Codecov for documentation',
    status: 'MVP',
    github: 'https://github.com/ryanwaits/doccov',
    sections: [
      {
        id: 'problem',
        title: 'The Problem',
        content: `Code coverage has tooling. Documentation coverage? Nothing.

You ship a library with 50 exports. How many are documented? Which ones are missing @param tags? Nobody knows until a user files an issue. I got tired of guessing.`,
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
            'DOCCOV COVERAGE REPORT',
            '',
            'Overall:    ████████░░░░░░░░░░░░  42%',
            '',
            'Functions   ████████████░░░░░░░░  58%',
            'Classes     ██████░░░░░░░░░░░░░░  31%',
            'Types       ████████████████░░░░  78%',
            'Interfaces  ████████░░░░░░░░░░░░  45%',
            '',
            '⚠ 23 exports missing documentation',
            '⚠ 12 functions missing @param',
            '⚠ 8 functions missing @returns',
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

Started as 2000 lines of TypeScript. Now it's 100 lines of prompts. Deleted 95% of the code. The tool got better.`,
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
  secondlayer: {
    name: 'secondlayer',
    tagline: 'Type-safe Clarity contract interfaces',
    status: 'Stable',
    github: 'https://github.com/ryanwaits/secondlayer',
    sections: [
      {
        id: 'problem',
        title: 'The Problem',
        content: `Clarity contracts have no TypeScript integration. Manual type definitions drift. Call parameters are untyped strings.

You deploy a contract with 20 functions. Every call site in your app? Untyped. Every parameter? Hope you got the order right.`,
        terminal: {
          output: [
            '// Calling a Clarity contract today',
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
            '// No autocomplete. No type errors.',
            '// Find bugs in production.',
          ]
        }
      },
      {
        id: 'solution',
        title: 'The Solution',
        content: `secondlayer generates type-safe interfaces from contract source or deployed contracts.

Point at a contract address or local file. Auto-infers network from address prefix. Get TypeScript that knows your contract.`,
        terminal: {
          command: 'npx secondlayer generate SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait',
          typing: true,
          output: [
            '$ npx secondlayer generate SP2PABAF...nft-trait',
            '',
            '◐ Fetching contract from mainnet...',
            '◐ Parsing Clarity source...',
            '◐ Generating TypeScript interfaces...',
          ]
        }
      },
      {
        id: 'output',
        title: 'The Output',
        content: `Generated interfaces match your contract exactly. Helper functions for read/write calls. Type-safe parameters — wrong types don't compile.

Every public function. Every argument. Every return type.`,
        terminal: {
          output: [
            '// Generated: nft-trait.ts',
            '',
            'export interface NftTrait {',
            '  getLastTokenId(): Promise<Response<uint, never>>;',
            '  getTokenUri(tokenId: uint): Promise<Response<string, uint>>;',
            '  getOwner(tokenId: uint): Promise<Response<principal, uint>>;',
            '  transfer(',
            '    tokenId: uint,',
            '    sender: principal,',
            '    recipient: principal',
            '  ): Promise<Response<boolean, uint>>;',
            '}',
            '',
            '// Now TypeScript catches the bugs.',
          ]
        }
      },
      {
        id: 'plugins',
        title: 'Plugins',
        content: `Extend generation with plugins. clarinet() reads from Clarinet projects. react() generates hooks. testing() adds mock helpers.

Pick what you need. Skip what you don't.`,
        terminal: {
          output: [
            '// secondlayer.config.ts',
            '',
            'import { defineConfig } from "secondlayer";',
            'import { clarinet } from "secondlayer/plugins";',
            'import { react } from "secondlayer/plugins";',
            '',
            'export default defineConfig({',
            '  plugins: [',
            '    clarinet(),      // read from Clarinet.toml',
            '    react(),         // generate useContract hooks',
            '  ],',
            '  outDir: "./generated"',
            '});',
          ]
        }
      },
      {
        id: 'install',
        title: 'Get Started',
        content: `Install. Run. Get types. Zero config for basic usage — just point at a contract address and go.`,
        terminal: {
          command: 'npm install secondlayer',
          output: [
            '$ npm install secondlayer',
            '+ secondlayer@0.5.0',
            '',
            '$ npx secondlayer generate SP2...my-contract',
            '',
            '✓ Generated my-contract.ts',
            '✓ 12 functions typed',
            '✓ 4 read-only functions',
            '✓ 8 public functions',
            '',
            '→ ./generated/my-contract.ts',
          ]
        }
      }
    ]
  },
  openpkg: {
    name: 'openpkg',
    tagline: 'OpenAPI for TypeScript packages',
    status: 'Stable',
    github: 'https://github.com/ryanwaits/openpkg',
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
        content: `Point at any package. Local path or npm registry. One command, JSON Schema out. No config, no setup, just the API surface.`,
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
}

// Order of projects for navigation (matches lib/projects.ts)
const PROJECT_ORDER = ['openpkg', 'doccov', 'secondlayer']

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
