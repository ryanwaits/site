import { Link } from "next-view-transitions";

interface AnimatedNameProps {
  date?: string;
  title?: string;
  category?: string;
}

export function AnimatedName({ date, title, category = "Writing" }: AnimatedNameProps) {
  return (
    <div className="fade-in mb-4">
      {/* Breadcrumb */}
      <nav className="font-mono text-xs uppercase tracking-wider text-[#595959] mb-4">
        <Link href="/" className="hover:text-[#0b0d0b] transition-colors">
          Ryan Waits
        </Link>
        <span className="mx-2 opacity-50">//</span>
        <span>[{category}]</span>
        {title && (
          <>
            <span className="mx-2 opacity-50"></span>
            <span className="text-[#0b0d0b]/50">{title}</span>
          </>
        )}
      </nav>

      {/* Date */}
      {date && (
        <time className="block font-mono text-xs uppercase tracking-wider text-[#595959]">
          {date}
        </time>
      )}
    </div>
  );
}
