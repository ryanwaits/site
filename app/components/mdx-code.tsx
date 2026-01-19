import type { RawCode } from 'codehike/code';
import { cn } from '@/lib/utils';
import { DocsKitCode } from '@/app/components/docskit';

type PreProps = {
  children?: React.ReactNode;
  className?: string;
};

/**
 * Extract code content, language, and meta from MDX pre/code structure.
 * MDX renders fenced code blocks as: <pre><code className="language-xxx">...</code></pre>
 *
 * NOTE: With fumadocs-mdx + CodeHike, most code blocks are handled directly by
 * DocsKitCode via the recma plugin. This is a fallback for edge cases.
 */
function extractCodeInfo(children: React.ReactNode): { code: string; lang: string; meta: string } | null {
  if (!children || typeof children !== 'object') return null;

  const child = children as React.ReactElement<Record<string, unknown>>;

  // Check if it's a code element
  const isCodeElement = child.type === 'code' ||
    (typeof child.type === 'function' && (child.type as any).name === 'MdxCode') ||
    (typeof child.type === 'function');

  if (!isCodeElement) return null;

  const props = child.props || {};
  const className = (props.className as string) || '';

  // Extract language from className (e.g., "language-json")
  const langMatch = className.match(/language-(\w+)/);
  const lang = langMatch ? langMatch[1] : 'txt';

  // Get the raw code string
  let code = '';
  const codeChildren = props.children;
  if (typeof codeChildren === 'string') {
    code = codeChildren;
  } else if (Array.isArray(codeChildren)) {
    code = codeChildren.join('');
  }

  return { code, lang, meta: '' };
}

/**
 * MDX Pre component - fallback for code blocks not processed by CodeHike.
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
    value: code.replace(/\n$/, ''),
    lang,
    meta,
  };

  return <DocsKitCode codeblock={codeblock} className={className} />;
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
