export function SiteFooter() {
  return (
    <footer className="flex-shrink-0 px-6 py-4 border-t border-[var(--color-border)]">
      <div className="flex gap-4 font-mono text-xs text-[var(--color-muted)]">
        <a
          href="https://x.com/ryan_waits"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[var(--color-text)] transition-colors"
        >
          @ryan_waits
        </a>
        <span>·</span>
        <a
          href="https://github.com/ryanwaits"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[var(--color-text)] transition-colors"
        >
          github
        </a>
      </div>
    </footer>
  );
}
