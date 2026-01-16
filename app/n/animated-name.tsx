import { Link } from "next-view-transitions";

interface AnimatedNameProps {
  date?: string;
  title?: string;
  category?: string;
}

export function AnimatedName({ date, title, category = "Writing" }: AnimatedNameProps) {
  return (
    <div className="mb-4">
      {/* Breadcrumb */}
      <nav className="font-mono text-xs uppercase tracking-wider text-[var(--color-muted)] mb-4">
        <Link href="/" className="hover:text-[var(--color-text)] transition-colors">
          Ryan Waits
        </Link>
        <span className="mx-2 opacity-50">//</span>
        <span>[{category}]</span>
        {title && (
          <>
            <span className="mx-2 opacity-50"></span>
            <span className="text-[var(--color-text)]/50">{title}</span>
          </>
        )}
      </nav>

      {/* Date */}
      {date && (
        <time className="block font-mono text-xs uppercase tracking-wider text-[var(--color-muted)]">
          {date}
        </time>
      )}
    </div>
  );
}
