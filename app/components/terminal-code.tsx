import { highlight, Pre, type RawCode } from 'codehike/code';
import { theme } from '@/app/components/docskit/code.config';
import { getHandlers } from '@/app/components/docskit/code.handlers';
import { cn } from '@/lib/utils';

interface TerminalCodeProps {
  code: string;
  lang?: string;
  title?: string;
  className?: string;
}

/**
 * Terminal-styled code block using CodeHike for syntax highlighting.
 * Matches the console/terminal aesthetic.
 */
export async function TerminalCode({
  code,
  lang = 'bash',
  title = 'terminal',
  className,
}: TerminalCodeProps) {
  const codeblock: RawCode = {
    value: code.replace(/\n$/, ''),
    lang,
    meta: '',
  };

  const highlighted = await highlight(codeblock, theme);
  const handlers = getHandlers({});
  const { background: _background, ...highlightedStyle } = highlighted.style;

  return (
    <div className={cn('font-mono text-xs', className)}>
      {/* Outer Frame */}
      <div className="flex flex-col bg-[var(--console-outer-bg)] border border-[var(--color-text)] p-1">
        {/* Title Bar */}
        <div className="flex items-center gap-3 px-1 py-1">
          {/* Terminal Icon */}
          <div className="p-0.5 text-[var(--color-text)]">
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M11 0H1V1H0V11H1V12H11V11H12V1H11V0ZM11 1V11H1V1H11ZM6 7H10V8H6V7ZM3 7H2V8H3V7ZM4 6V7H3V6H4ZM4 5V6H5V5H4ZM3 4H4V5H3V4ZM3 4V3H2V4H3Z" fill="currentColor"/>
            </svg>
          </div>

          {/* Horizontal line */}
          <div className="flex-1 h-px bg-[var(--color-muted)]" />

          {/* Title Label */}
          <span className="text-[10px] text-[var(--color-text)] tracking-[0.15em] uppercase font-medium whitespace-nowrap">
            [ {title} ]
          </span>

          {/* Horizontal line */}
          <div className="flex-1 h-px bg-[var(--color-muted)]" />
        </div>

        {/* Inner Content Frame */}
        <div className="border border-[var(--color-text)] bg-[var(--console-content-bg)] overflow-hidden">
          <Pre
            code={highlighted}
            className="overflow-auto px-4 py-3 m-0 rounded-none !bg-[var(--console-content-bg)] selection:bg-[var(--ch-selection)] max-h-[400px]"
            style={highlightedStyle}
            handlers={handlers}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Simpler variant without the frame - just highlighted code with terminal styling.
 */
export async function TerminalCodeSimple({
  code,
  lang = 'bash',
  className,
}: Omit<TerminalCodeProps, 'title'>) {
  const codeblock: RawCode = {
    value: code.replace(/\n$/, ''),
    lang,
    meta: '',
  };

  const highlighted = await highlight(codeblock, theme);
  const handlers = getHandlers({});
  const { background: _background, ...highlightedStyle } = highlighted.style;

  return (
    <div className={cn('font-mono text-xs bg-[var(--console-content-bg)] rounded overflow-hidden', className)}>
      <Pre
        code={highlighted}
        className="overflow-auto px-4 py-3 m-0 rounded-none !bg-[var(--console-content-bg)] selection:bg-[var(--ch-selection)] max-h-[400px]"
        style={highlightedStyle}
        handlers={handlers}
      />
    </div>
  );
}
