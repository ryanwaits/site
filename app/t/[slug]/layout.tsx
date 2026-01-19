import { SiteNav } from '@/app/components/site-nav';
import { SiteFooter } from '@/app/components/site-footer';

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col bg-[var(--color-bg)]">
      <SiteNav />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl px-6 py-12 md:py-16 md:ml-[72px]">
          <article>{children}</article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
