import { highlight, Pre as CodeHikePre, type RawCode } from 'codehike/code';
import { theme } from '@/app/components/docskit/code.config';
import { getHandlers } from '@/app/components/docskit/code.handlers';
import { cn } from '@/lib/utils';
import { CopyButton } from '@/app/components/docskit/code.copy';
import { CodeIcon } from '@/app/components/docskit/code.icon';

type PreProps = {
  children?: React.ReactNode;
  className?: string;
};

/**
 * Extract code content and language from MDX pre/code structure.
 * MDX renders fenced code blocks as: <pre><code className="language-xxx">...</code></pre>
 */
function extractCodeInfo(children: React.ReactNode): { code: string; lang: string; meta: string } | null {
  if (!children || typeof children !== 'object') return null;

  const child = children as React.ReactElement<{ className?: string; children?: React.ReactNode }>;

  // Check if it's a code element - could be string 'code' or the MdxCode component
  const isCodeElement = child.type === 'code' ||
    (typeof child.type === 'function' && (child.type as any).name === 'MdxCode') ||
    (typeof child.type === 'function');

  if (!isCodeElement) return null;

  const className = child.props?.className || '';
  const langMatch = className.match(/language-(\w+)/);
  const lang = langMatch ? langMatch[1] : 'txt';

  // Get the raw code string - might be nested
  let code = '';
  if (typeof child.props?.children === 'string') {
    code = child.props.children;
  } else if (Array.isArray(child.props?.children)) {
    code = child.props.children.join('');
  }

  return { code, lang, meta: '' };
}

/**
 * MDX Pre component that uses CodeHike for syntax highlighting.
 * Automatically handles fenced code blocks in MDX files.
 */
export async function MdxPre({ children, className }: PreProps) {
  const codeInfo = extractCodeInfo(children);

  // If we can't extract code info, render as regular pre
  if (!codeInfo || !codeInfo.code) {
    return (
      <pre className={cn('bg-[var(--color-border)] p-4 rounded-lg overflow-x-auto mb-6 text-sm', className)}>
        {children}
      </pre>
    );
  }

  const { code, lang, meta } = codeInfo;

  const codeblock: RawCode = {
    value: code.replace(/\n$/, ''), // Remove trailing newline
    lang,
    meta,
  };

  const highlighted = await highlight(codeblock, theme);
  const handlers = getHandlers({ copyButton: true });
  const { background: _background, ...highlightedStyle } = highlighted.style;

  const title = meta.trim() || null;

  return (
    <div className="group rounded overflow-hidden relative flex flex-col my-4 not-prose">
      {title ? (
        <div
          className={cn(
            'border-b-[1px] border-dk-border bg-dk-tabs-background px-3 py-0',
            'w-full h-9 flex items-center shrink-0',
            'text-dk-tab-inactive-foreground text-sm font-mono',
          )}
        >
          <div className="flex items-center h-5 gap-2">
            <div className="size-4">
              <CodeIcon title={title} lang={lang} className="opacity-60" />
            </div>
            <span className="leading-none">{title}</span>
          </div>
        </div>
      ) : null}
      <div className="relative flex items-start">
        <CodeHikePre
          code={highlighted}
          className="overflow-auto px-0 py-3 m-0 rounded-none bg-[var(--code-bg)] selection:bg-[var(--code-bg)] selection:text-current max-h-full flex-1"
          style={highlightedStyle}
          handlers={handlers}
        />
        <CopyButton
          text={code}
          variant="floating"
          className={cn(
            'absolute right-3 z-10 text-dk-tab-inactive-foreground',
            title ? 'top-3' : 'top-1/2 -translate-y-1/2',
          )}
        />
      </div>
    </div>
  );
}

/**
 * MDX inline code component - simple styling without CodeHike.
 * For inline code like `this`.
 */
export function MdxCode({ children, className, ...props }: React.ComponentPropsWithoutRef<'code'>) {
  // Check if this is inside a pre (fenced code block) - if so, just return children
  // The pre component handles the highlighting
  if (className?.includes('language-')) {
    return <code className={className} {...props}>{children}</code>;
  }

  // Inline code styling
  return (
    <code
      className={cn(
        'bg-[var(--color-border)] px-1.5 py-0.5 rounded text-sm font-mono',
        className
      )}
      {...props}
    >
      {children}
    </code>
  );
}
