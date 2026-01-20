'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { key: 'W', label: 'Work', href: '/work' },
  { key: 'T', label: 'Text', href: '/text' },
  { key: 'J', label: 'Jobs', href: '/jobs' },
  { key: 'P', label: 'Playground', href: '/playground' },
];

// Map nested routes to their parent top-level page
function getParentRoute(pathname: string): string | null {
  // Define route mappings: prefix → parent
  const routeMappings: Array<{ prefix: string; parent: string }> = [
    { prefix: '/t/', parent: '/text' },           // Blog posts → Text
    { prefix: '/playground/', parent: '/playground' },
    { prefix: '/work/', parent: '/work' },
    { prefix: '/jobs/', parent: '/jobs' },
  ];

  for (const { prefix, parent } of routeMappings) {
    if (pathname.startsWith(prefix)) {
      return parent;
    }
  }

  return null; // No parent (already at top level)
}

export function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === '/';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    // /t/* posts belong to Text section
    if (href === '/text' && pathname.startsWith('/t/')) return true;
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

      // Escape goes to parent page (if on nested route)
      if (e.key === 'Escape') {
        const parent = getParentRoute(pathname);
        if (parent) {
          router.push(parent);
          return;
        }
      }

      // Arrow key navigation through pages (only on main nav pages, not /t/* posts)
      const allPages = ['/', ...NAV_ITEMS.map(item => item.href)];
      const currentIndex = allPages.indexOf(pathname);

      // Only allow arrow nav on main nav pages
      if (currentIndex !== -1) {
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
          router.push(allPages[currentIndex - 1]);
          return;
        }
        if (e.key === 'ArrowRight' && currentIndex < allPages.length - 1) {
          router.push(allPages[currentIndex + 1]);
          return;
        }
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="flex-shrink-0 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left: Logo + Nav Items */}
        <div className="flex items-center gap-1">
          <Link
            href="/"
            className="font-mono text-sm uppercase tracking-wider mr-4 hover:opacity-70 transition-opacity leading-none"
          >
            <span className={isHome ? 'text-[var(--color-nav-active)]' : 'text-[var(--color-text)]'}>
              RW
            </span>
          </Link>

          {/* Desktop nav items */}
          <span className="hidden md:inline text-[var(--color-muted)] mr-3">//</span>

          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="hidden md:inline font-mono text-xs uppercase tracking-wider px-2 py-1 text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors duration-150"
              >
                <span className={active ? 'text-[var(--color-nav-active)]' : 'opacity-50'}>
                  [{item.key}]
                </span>
                <span className="ml-1">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Desktop: Agent Button */}
          <button
            onClick={() => window.dispatchEvent(new Event('toggle-agent'))}
            className="hidden md:block font-mono text-xs uppercase tracking-wider px-3 py-1.5 border border-[var(--color-text)] text-[var(--color-text)] hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] transition-colors duration-150"
          >
            <span className="opacity-50">[A]</span>
            <span className="ml-1">Agent</span>
          </button>

          {/* Mobile: Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[var(--color-text)]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-bg)]">
          <div className="px-6 py-4 space-y-3">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block font-mono text-sm uppercase tracking-wider text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors duration-150"
                >
                  <span className={active ? 'text-[var(--color-nav-active)]' : 'opacity-50'}>
                    [{item.key}]
                  </span>
                  <span className="ml-2">{item.label}</span>
                </Link>
              );
            })}

          </div>
        </div>
      )}
    </nav>
  );
}
