import { PostNavigationWrapper } from './post-navigation-wrapper';
import { SiteNav } from '../components/site-nav';
import { SiteFooter } from '../components/site-footer';
import { getPosts } from './posts.server';

export default async function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const posts = await getPosts();

  return (
    <div className="h-screen flex flex-col bg-[var(--color-bg)]">
      <SiteNav />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl px-6 py-12 md:py-16 md:ml-[72px]">
          <article>{children}</article>
          <PostNavigationWrapper posts={posts} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
