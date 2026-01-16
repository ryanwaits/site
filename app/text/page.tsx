'use client'

import Link from 'next/link'
import { SiteNav } from '../components/site-nav'
import { SiteFooter } from '../components/site-footer'

const TEXT = [
  { title: 'From 2000 Lines to 100', date: 'December 2025', description: 'Deleted 95% of the codebase. The tool got better.', slug: '/n/2000-to-100' },
  { title: "Features Don't Compose", date: 'December 2025', description: "The agent doesn't need your features — it needs your surfaces.", slug: '/n/features-dont-compose' },
  { title: 'New Standard, Who Dis?', date: 'December 2025', description: 'Standard Schema shipped. Runtime extraction just got universal.', slug: '/n/new-standard-who-dis' },
  { title: 'Pick a Standard, Extend Carefully', date: 'December 2025', description: 'Custom formats are a trap. Standards are leverage.', slug: '/n/json-schema-contract' },
  { title: 'Codecov, But for Docs', date: 'October 2025', description: 'Code coverage has tooling. Documentation coverage? Nothing.', slug: '/n/codecov-but-for-docs' },
  { title: 'How Does This Not Exist?', date: 'October 2025', description: 'REST APIs have OpenAPI. GraphQL has introspection. TypeScript packages have... nothing.', slug: '/n/how-does-this-not-exist' },
]

export default function TextPage() {
  return (
    <div className="h-screen flex flex-col bg-[var(--color-bg)]">
      <SiteNav />
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-xl ml-[72px]">
          <div className="flex items-center gap-3 mb-4 border-b border-[var(--color-border)] pb-3">
            <span className="font-mono text-xs text-[var(--color-muted)]">/</span>
            <h2 className="font-mono text-xs uppercase tracking-wider text-[var(--color-text)]">
              text
            </h2>
            <span className="font-mono text-xs text-[var(--color-muted)]">
              ({TEXT.length})
            </span>
          </div>

          <section className="space-y-6">
            {TEXT.map((post, i) => (
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
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
