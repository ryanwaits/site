'use client'

import { SiteNav } from '../components/site-nav'
import { SiteFooter } from '../components/site-footer'

const PROJECTS = [
  { name: 'openpkg', description: 'TypeScript API extraction for packages', url: 'https://github.com/ryanwaits/openpkg' },
  { name: 'doccov', description: 'Documentation coverage analysis', url: 'https://github.com/ryanwaits/doccov' },
  { name: 'chainhooks-mcp', description: 'MCP server for Chainhook integration', url: 'https://github.com/ryanwaits/chainhooks-mcp' },
]

export default function ProjectsPage() {
  return (
    <div className="h-screen flex flex-col bg-[var(--color-bg)]">
      <SiteNav />
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-xl md:ml-[72px]">
          <div className="flex items-center gap-3 mb-4 border-b border-[var(--color-border)] pb-3">
            <span className="font-mono text-xs text-[var(--color-muted)]">/</span>
            <h2 className="font-mono text-xs uppercase tracking-wider text-[var(--color-text)]">
              projects
            </h2>
            <span className="font-mono text-xs text-[var(--color-muted)]">
              ({PROJECTS.length})
            </span>
          </div>

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
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
