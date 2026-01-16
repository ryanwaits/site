'use client'

import { SiteNav } from '../components/site-nav'
import { SiteFooter } from '../components/site-footer'
import { AmigoCard } from './components/amigo-card'

const EXPERIMENTS: Array<{
  id: string
  name: string
  tagline: string
  description: string
  component: React.ComponentType
  links: { github?: string; post?: string }
}> = [
  {
    id: 'amigo',
    name: 'Amigo',
    tagline: 'Learn Spanish through real situations',
    description: 'Personalized flashcard sprints with spaced repetition. Train for specific scenarios — ordering at a taqueria, meeting someone\'s parents, traveling in Mexico.',
    component: AmigoCard,
    links: {
      github: 'https://github.com/ryanwaits/amigo',
    }
  },
]

const COMING_SOON = [
  { name: 'doccov', description: 'Documentation coverage analysis' },
  { name: 'openpkg', description: 'TypeScript API extraction' },
]

export default function PlaygroundPage() {
  return (
    <div className="h-screen flex flex-col bg-[var(--color-bg)]">
      <SiteNav />
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-3xl md:ml-[72px]">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2 border-b border-[var(--color-border)] pb-3">
            <span className="font-mono text-xs text-[var(--color-muted)]">/</span>
            <h2 className="font-mono text-xs uppercase tracking-wider text-[var(--color-text)]">
              playground
            </h2>
            <span className="font-mono text-xs text-[var(--color-muted)]">
              ({EXPERIMENTS.length})
            </span>
          </div>

          <p className="text-sm text-[var(--color-muted)] mb-8 max-w-md">
            Side projects and tools I'm building. Some for myself, some hoping others find useful.
          </p>

          {/* Main experiments */}
          <section className="max-w-md mb-12">
            {EXPERIMENTS.map((experiment) => (
              <article key={experiment.id} className="group">
                {/* Interactive card */}
                <experiment.component />

                {/* Info below card */}
                <div className="mt-4">
                  <div className="flex items-baseline gap-2 mb-1">
                    <h3 className="font-mono text-sm text-[var(--color-text)]">
                      {experiment.name}
                    </h3>
                    <span className="font-mono text-[10px] text-[var(--color-muted)]">
                      — {experiment.tagline}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-muted)] leading-relaxed mb-2">
                    {experiment.description}
                  </p>
                  <div className="flex gap-3">
                    {experiment.links.github && (
                      <a
                        href={experiment.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                      >
                        GitHub ↗
                      </a>
                    )}
                    {experiment.links.post && (
                      <a
                        href={experiment.links.post}
                        className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                      >
                        Read more →
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>

          {/* Coming soon section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
                Coming soon
              </span>
              <div className="flex-1 h-px bg-[var(--color-border)]" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {COMING_SOON.map((item) => (
                <div
                  key={item.name}
                  className="p-4 border border-[var(--color-border)] rounded opacity-50"
                >
                  <span className="font-mono text-xs text-[var(--color-text)]">
                    {item.name}
                  </span>
                  <p className="text-xs text-[var(--color-muted)] mt-1">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
