'use client'

import { useState } from 'react'
import Link from 'next/link'

type Section = 'jobs' | 'projects' | 'writing' | 'playground'

const NAV_ITEMS: { key: string; label: string; section: Section }[] = [
  { key: 'J', label: 'Jobs', section: 'jobs' },
  { key: 'P', label: 'Projects', section: 'projects' },
  { key: 'W', label: 'Writing', section: 'writing' },
  { key: 'G', label: 'Playground', section: 'playground' },
]

const JOBS = [
  { title: 'Product Engineer', company: 'Hiro', period: '2021 — 2024', description: 'Developer tools for Bitcoin' },
  { title: 'Senior Engineer', company: 'Blockstack', period: '2019 — 2021', description: 'Decentralized apps platform' },
  { title: 'Software Engineer', company: 'Startup Co', period: '2017 — 2019', description: 'Early stage fintech' },
]

const PROJECTS = [
  { name: 'openpkg', description: 'TypeScript API extraction for packages', url: 'https://github.com/ryanwaits/openpkg' },
  { name: 'doccov', description: 'Documentation coverage analysis', url: 'https://github.com/ryanwaits/doccov' },
  { name: 'chainhooks-mcp', description: 'MCP server for Chainhook integration', url: 'https://github.com/ryanwaits/chainhooks-mcp' },
]

const WRITING = [
  { title: 'From 2000 Lines to 100', date: 'December 2025', description: 'Deleted 95% of the codebase. The tool got better.', slug: '/n/2000-to-100' },
  { title: "Features Don't Compose", date: 'December 2025', description: "The agent doesn't need your features — it needs your surfaces.", slug: '/n/features-dont-compose' },
  { title: 'New Standard, Who Dis?', date: 'December 2025', description: 'Standard Schema shipped. Runtime extraction just got universal.', slug: '/n/new-standard-who-dis' },
  { title: 'Pick a Standard, Extend Carefully', date: 'December 2025', description: 'Custom formats are a trap. Standards are leverage.', slug: '/n/json-schema-contract' },
  { title: 'Codecov, But for Docs', date: 'October 2025', description: 'Code coverage has tooling. Documentation coverage? Nothing.', slug: '/n/codecov-but-for-docs' },
  { title: 'How Does This Not Exist?', date: 'October 2025', description: 'REST APIs have OpenAPI. GraphQL has introspection. TypeScript packages have... nothing.', slug: '/n/how-does-this-not-exist' },
]

const PLAYGROUND = [
  { name: 'API Playground', description: 'Interactive API explorer', status: 'coming soon' },
  { name: 'Component Lab', description: 'UI component experiments', status: 'coming soon' },
  { name: 'Prompt Tester', description: 'LLM prompt iteration tool', status: 'coming soon' },
]

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<Section>('writing')

  return (
    <div className="h-screen flex flex-col bg-[var(--color-bg)] overflow-hidden">
      {/* Top Navigation */}
      <nav className="flex-shrink-0 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left: Logo + Nav Items */}
          <div className="flex items-center gap-1">
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--color-text)] mr-4">
              RW
            </span>

            <span className="text-[var(--color-muted)] mr-3">//</span>

            {NAV_ITEMS.map((item) => (
              <button
                key={item.section}
                onClick={() => setActiveSection(item.section)}
                className={`
                  font-mono text-xs uppercase tracking-wider px-2 py-1
                  transition-colors duration-150
                  ${activeSection === item.section
                    ? 'text-[var(--color-text)]'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                  }
                `}
              >
                <span className="opacity-50">[{item.key}]</span>
                <span className="ml-1">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Right: Agent Button */}
          <button
            onClick={() => window.dispatchEvent(new Event('toggle-agent'))}
            className="font-mono text-xs uppercase tracking-wider px-3 py-1.5 border border-[var(--color-text)] text-[var(--color-text)] hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] transition-colors duration-150"
          >
            <span className="opacity-50">[A]</span>
            <span className="ml-1">Agent</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden px-6 py-8">
        <div className="h-full flex flex-col max-w-xl">
          {/* Header */}
          <header className="flex-shrink-0 mb-6">
            <h1 className="font-serif text-4xl text-[var(--color-text)] mb-3">
              Ryan Waits
            </h1>
            <p className="text-[var(--color-muted)] leading-relaxed">
              Product engineer building developer tools. Previously at{' '}
              <Link href="/work" className="text-[var(--color-text)] underline underline-offset-2">
                Hiro
              </Link>
              , helping developers build on Bitcoin.
            </p>
          </header>

          {/* Section Header */}
          <div className="flex-shrink-0 flex items-center gap-3 mb-4 border-b border-[var(--color-border)] pb-3">
            <span className="font-mono text-xs text-[var(--color-muted)]">/</span>
            <h2 className="font-mono text-xs uppercase tracking-wider text-[var(--color-text)]">
              {activeSection}
            </h2>
            <span className="font-mono text-xs text-[var(--color-muted)]">
              ({activeSection === 'jobs' ? JOBS.length :
                activeSection === 'projects' ? PROJECTS.length :
                activeSection === 'writing' ? WRITING.length :
                PLAYGROUND.length})
            </span>
          </div>

          {/* Content Sections - scrollable container */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {activeSection === 'jobs' && (
              <section className="space-y-6">
                {JOBS.map((job, i) => (
                  <article key={i} className="group">
                    <div className="flex items-baseline justify-between mb-1">
                      <h3 className="text-[var(--color-text)] font-medium">
                        {job.title}
                      </h3>
                      <span className="font-mono text-xs text-[var(--color-muted)]">
                        {job.period}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-muted)]">
                      {job.company} — {job.description}
                    </p>
                  </article>
                ))}
              </section>
            )}

            {activeSection === 'projects' && (
              <section className="space-y-6">
                {PROJECTS.map((project, i) => (
                  <article key={i}>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                    >
                      <div className="flex items-baseline gap-2 mb-1">
                        <h3 className="text-[var(--color-text)] font-medium group-hover:underline underline-offset-2">
                          {project.name}
                        </h3>
                        <span className="font-mono text-xs text-[var(--color-muted)]">↗</span>
                      </div>
                      <p className="text-sm text-[var(--color-muted)]">
                        {project.description}
                      </p>
                    </a>
                  </article>
                ))}
              </section>
            )}

            {activeSection === 'writing' && (
              <section className="space-y-6">
                {WRITING.map((post, i) => (
                  <article key={i}>
                    <Link href={post.slug} className="group block">
                      <time className="font-mono text-xs uppercase tracking-wider text-[var(--color-muted)] block mb-1">
                        {post.date}
                      </time>
                      <h3 className="font-serif text-xl text-[var(--color-text)] group-hover:underline underline-offset-2 mb-1">
                        {post.title}
                      </h3>
                      <p className="text-[var(--color-muted)]">
                        {post.description}
                      </p>
                    </Link>
                  </article>
                ))}
              </section>
            )}

            {activeSection === 'playground' && (
              <section className="space-y-6">
                {PLAYGROUND.map((item, i) => (
                  <article key={i} className="opacity-50">
                    <div className="flex items-baseline gap-3 mb-1">
                      <h3 className="text-[var(--color-text)] font-medium">
                        {item.name}
                      </h3>
                      <span className="font-mono text-xs text-[var(--color-muted)] border border-[var(--color-border)] px-1.5 py-0.5">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-muted)]">
                      {item.description}
                    </p>
                  </article>
                ))}
              </section>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 px-6 py-4 border-t border-[var(--color-border)]">
        <div className="flex gap-4 font-mono text-xs text-[var(--color-muted)]">
          <a
            href="https://x.com/ryan_waits"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--color-text)] transition-colors"
          >
            @ryan_waits
          </a>
          <span>·</span>
          <a
            href="https://github.com/ryanwaits"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--color-text)] transition-colors"
          >
            github
          </a>
        </div>
      </footer>
    </div>
  )
}
