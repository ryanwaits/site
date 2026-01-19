import { getPages } from '@/lib/source';
import { Link } from 'next-view-transitions';
import { SiteNav } from '@/app/components/site-nav';
import { SiteFooter } from '@/app/components/site-footer';

export default function TextPage() {
  const pages = getPages();

  return (
    <div className="h-screen flex flex-col bg-[var(--color-bg)]">
      <SiteNav />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl px-6 py-12 md:py-16 md:ml-[72px]">
          <h1 className="text-3xl font-serif mb-8">Text</h1>
          <div className="space-y-4">
            {pages.map((page) => (
              <Link
                key={page.url}
                href={page.url}
                className="block hover:text-[var(--color-accent)]"
              >
                {page.data.title}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
