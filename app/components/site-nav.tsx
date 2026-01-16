'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { key: 'J', label: 'Jobs', href: '/jobs' },
  { key: 'P', label: 'Projects', href: '/projects' },
  { key: 'T', label: 'Text', href: '/text' },
  { key: 'E', label: 'Experiments', href: '/experiments' },
];

export function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === '/';

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    // /n/* posts belong to Text section
    if (href === '/text' && pathname.startsWith('/n/')) return true;
    return pathname === href || pathname.startsWith(href + '/');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === '/') {
        e.preventDefault();
        router.push('/');
        return;
      }

      // Arrow key navigation through pages
      const allPages = ['/', ...NAV_ITEMS.map(item => item.href)];
      const currentIndex = allPages.indexOf(pathname);

      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        router.push(allPages[currentIndex - 1]);
        return;
      }
      if (e.key === 'ArrowRight' && currentIndex < allPages.length - 1) {
        router.push(allPages[currentIndex + 1]);
        return;
      }

      const key = e.key.toUpperCase();
      const navItem = NAV_ITEMS.find(item => item.key === key);
      if (navItem) {
        router.push(navItem.href);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return (
    <nav className="flex-shrink-0 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left: Logo + Nav Items */}
        <div className="flex items-center gap-1">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-wider mr-4 hover:opacity-70 transition-opacity"
          >
            <span className={isHome ? 'text-[var(--color-nav-active)]' : 'text-[var(--color-text)]'}>
              RW
            </span>
          </Link>

          <span className="text-[var(--color-muted)] mr-3">//</span>

          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="font-mono text-xs uppercase tracking-wider px-2 py-1 text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors duration-150"
              >
                <span className={active ? 'text-[var(--color-nav-active)]' : 'opacity-50'}>
                  [{item.key}]
                </span>
                <span className="ml-1">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right: Agent Button */}
        <button
          onClick={() => window.dispatchEvent(new Event('toggle-agent'))}
          className="font-mono text-xs uppercase tracking-wider px-3 py-1.5 border border-[var(--color-text)] text-[var(--color-text)] hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] transition-colors duration-150"
        >
          <span className="opacity-50">[A]</span>
          <span className="ml-1">Agent</span>
        </button>
      </div>
    </nav>
  );
}
