import Link from 'next/link'
import { SiteNav } from '../components/site-nav'
import { SiteFooter } from '../components/site-footer'
import { getPosts } from '@/content/posts.server'

export default async function TextPage() {
  const posts = await getPosts()

  return (
    <div className="h-screen flex flex-col bg-[var(--color-bg)]">
      <SiteNav />
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-xl md:ml-[72px]">
          <div className="flex items-center gap-3 mb-4 border-b border-[var(--color-border)] pb-3">
            <span className="font-mono text-xs text-[var(--color-muted)]">/</span>
            <h2 className="font-mono text-xs uppercase tracking-wider text-[var(--color-text)]">
              text
            </h2>
            <span className="font-mono text-xs text-[var(--color-muted)]">
              ({posts.length})
            </span>
          </div>

          <section className="space-y-6">
            {posts.map((post) => (
              <article key={post.slug}>
                <Link href={`/t/${post.slug}`} className="group block">
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
