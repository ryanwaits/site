'use client'

import Link from 'next/link'
import { SiteNav } from '../components/site-nav'
import { SiteFooter } from '../components/site-footer'

const PROJECTS = [
  {
    slug: 'doccov',
    name: 'doccov',
    tagline: 'Codecov for documentation',
    description: 'Documentation coverage analysis. Measures how well your public APIs are documented.',
    status: 'MVP',
    github: 'https://github.com/ryanwaits/doccov'
  },
  {
    slug: 'openpkg',
    name: 'openpkg',
    tagline: 'TypeScript API extraction',
    description: 'Extracts public API surface from any TypeScript package. Zero config.',
    status: 'Stable',
    github: 'https://github.com/ryanwaits/openpkg'
  },
  {
    slug: 'chainhooks-mcp',
    name: 'chainhooks-mcp',
    tagline: 'MCP server for Bitcoin events',
    description: 'Connect AI agents to Bitcoin event streams via Model Context Protocol.',
    status: 'Active',
    github: 'https://github.com/ryanwaits/chainhooks-mcp'
  },
]

export default function WorkPage() {
  return (
    <div className="h-screen flex flex-col bg-[var(--color-bg)]">
      <SiteNav />
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-xl md:ml-[72px]">
          <div className="flex items-center gap-3 mb-6 border-b border-[var(--color-border)] pb-3">
            <span className="font-mono text-xs text-[var(--color-muted)]">/</span>
            <h2 className="font-mono text-xs uppercase tracking-wider text-[var(--color-text)]">
              work
            </h2>
            <span className="font-mono text-xs text-[var(--color-muted)]">
              ({PROJECTS.length})
            </span>
          </div>

          <section className="space-y-8">
            {PROJECTS.map((project) => (
              <article key={project.slug} className="group">
                <Link href={`/work/${project.slug}`} className="block">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-mono text-[var(--color-text)] group-hover:underline underline-offset-2">
                      {project.name}
                    </h3>
                    <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-[var(--color-border)] text-[var(--color-muted)]">
                      {project.status}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-[var(--color-muted)] mb-1">
                    {project.tagline}
                  </p>
                  <p className="text-sm text-[var(--color-muted)] opacity-70">
                    {project.description}
                  </p>
                </Link>
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 font-mono text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  <span>GitHub</span>
                  <span>↗</span>
                </a>
              </article>
            ))}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
