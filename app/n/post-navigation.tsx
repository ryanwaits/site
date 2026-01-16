'use client';

import { useEffect } from 'react';
import { Link } from 'next-view-transitions';
import { useRouter } from 'next/navigation';
import { Post } from './posts';

interface PostNavigationProps {
  prev: Post | null;
  next: Post | null;
}

export function PostNavigation({ prev, next }: PostNavigationProps) {
  const router = useRouter();

  // Keyboard shortcuts for arrow navigation (Escape handled globally in site-nav)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowLeft' && prev) {
        router.push(`/n/${prev.slug}`);
      } else if (e.key === 'ArrowRight' && next) {
        router.push(`/n/${next.slug}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prev, next, router]);

  if (!prev && !next) return null;

  return (
    <nav className="mt-16 pt-8 border-t border-[var(--color-border)]">
      <div className="flex justify-between items-center gap-8">
        {/* Previous */}
        <div className="flex-1">
          {prev && (
            <Link
              href={`/n/${prev.slug}`}
              className="group flex items-center gap-3 no-underline"
            >
              <span className="font-mono text-xs text-[var(--color-muted)] group-hover:text-[var(--color-text)] transition-colors">[&larr;]</span>
              <span className="font-serif text-lg text-[var(--color-text)] group-hover:text-[var(--color-muted)] transition-colors">
                {prev.title}
              </span>
            </Link>
          )}
        </div>

        {/* Next */}
        <div className="flex-1 flex justify-end">
          {next && (
            <Link
              href={`/n/${next.slug}`}
              className="group flex items-center gap-3 no-underline"
            >
              <span className="font-serif text-lg text-[var(--color-text)] group-hover:text-[var(--color-muted)] transition-colors">
                {next.title}
              </span>
              <span className="font-mono text-xs text-[var(--color-muted)] group-hover:text-[var(--color-text)] transition-colors">[&rarr;]</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
