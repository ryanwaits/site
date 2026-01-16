'use client'

import Link from 'next/link'
import { SiteNav } from '../components/site-nav'
import { SiteFooter } from '../components/site-footer'

const JOBS = [
  { title: 'Product Engineer', company: 'Hiro', period: '2021 — 2024', description: 'Developer tools for Bitcoin' },
  { title: 'Senior Engineer', company: 'Blockstack', period: '2019 — 2021', description: 'Decentralized apps platform' },
  { title: 'Software Engineer', company: 'Startup Co', period: '2017 — 2019', description: 'Early stage fintech' },
]

export default function JobsPage() {
  return (
    <div className="h-screen flex flex-col bg-[var(--color-bg)]">
      <SiteNav />
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-xl ml-[72px]">
          <div className="flex items-center gap-3 mb-4 border-b border-[var(--color-border)] pb-3">
            <span className="font-mono text-xs text-[var(--color-muted)]">/</span>
            <h2 className="font-mono text-xs uppercase tracking-wider text-[var(--color-text)]">
              jobs
            </h2>
            <span className="font-mono text-xs text-[var(--color-muted)]">
              ({JOBS.length})
            </span>
          </div>

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
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
