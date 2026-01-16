'use client'

import { SiteNav } from '../components/site-nav'
import { SiteFooter } from '../components/site-footer'

const EXPERIMENTS = [
  { name: 'API Playground', description: 'Interactive API explorer', status: 'coming soon' },
  { name: 'Component Lab', description: 'UI component experiments', status: 'coming soon' },
  { name: 'Prompt Tester', description: 'LLM prompt iteration tool', status: 'coming soon' },
]

export default function ExperimentsPage() {
  return (
    <div className="h-screen flex flex-col bg-[var(--color-bg)]">
      <SiteNav />
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-xl md:ml-[72px]">
          <div className="flex items-center gap-3 mb-4 border-b border-[var(--color-border)] pb-3">
            <span className="font-mono text-xs text-[var(--color-muted)]">/</span>
            <h2 className="font-mono text-xs uppercase tracking-wider text-[var(--color-text)]">
              experiments
            </h2>
            <span className="font-mono text-xs text-[var(--color-muted)]">
              ({EXPERIMENTS.length})
            </span>
          </div>

          <section className="space-y-6">
            {EXPERIMENTS.map((item, i) => (
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
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
