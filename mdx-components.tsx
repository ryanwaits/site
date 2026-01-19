import React, { ComponentPropsWithoutRef } from 'react';
import { Link } from 'next-view-transitions';
import { MdxPre, MdxCode } from '@/app/components/mdx-code';

type HeadingProps = ComponentPropsWithoutRef<'h1'>;
type ParagraphProps = ComponentPropsWithoutRef<'p'>;
type ListProps = ComponentPropsWithoutRef<'ul'>;
type ListItemProps = ComponentPropsWithoutRef<'li'>;
type AnchorProps = ComponentPropsWithoutRef<'a'>;
type BlockquoteProps = ComponentPropsWithoutRef<'blockquote'>;

const components = {
  h1: (props: HeadingProps) => (
    <h1
      className="font-serif text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.1] pt-4 mb-8"
      {...props}
    />
  ),
  h2: (props: HeadingProps) => (
    <h2
      className="font-serif text-2xl md:text-3xl mt-12 mb-4 tracking-tight"
      {...props}
    />
  ),
  h3: (props: HeadingProps) => (
    <h3
      className="font-serif text-xl md:text-2xl mt-10 mb-3 tracking-tight"
      {...props}
    />
  ),
  h4: (props: HeadingProps) => (
    <h4 className="font-serif text-lg mt-8 mb-2" {...props} />
  ),
  p: (props: ParagraphProps) => (
    <p className="leading-[1.6] mb-6 text-[var(--color-text)]/80" {...props} />
  ),
  ol: (props: ListProps) => (
    <ol
      className="list-decimal pl-6 space-y-3 mb-6 text-[var(--color-text)]/80 leading-[1.6]"
      {...props}
    />
  ),
  ul: (props: ListProps) => (
    <ul
      className="list-disc pl-6 space-y-2 mb-6 text-[var(--color-text)]/80 leading-[1.6]"
      {...props}
    />
  ),
  li: (props: ListItemProps) => <li className="pl-1" {...props} />,
  em: (props: ComponentPropsWithoutRef<'em'>) => (
    <em className="italic" {...props} />
  ),
  strong: (props: ComponentPropsWithoutRef<'strong'>) => (
    <strong className="font-semibold" {...props} />
  ),
  a: ({ href, children, ...props }: AnchorProps) => {
    const className = 'text-[var(--color-accent)] underline decoration-[var(--color-accent)]/30 underline-offset-2 hover:decoration-[var(--color-accent)]/60 transition-colors';
    if (href?.startsWith('/')) {
      return (
        <Link href={href} className={className} {...props}>
          {children}
        </Link>
      );
    }
    if (href?.startsWith('#')) {
      return (
        <a href={href} className={className} {...props}>
          {children}
        </a>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        {...props}
      >
        {children}
      </a>
    );
  },
  pre: MdxPre,
  code: MdxCode,
  Table: ({ data }: { data: { headers: string[]; rows: string[][] } }) => (
    <table className="w-full mb-6 text-sm">
      <thead>
        <tr className="border-b border-[var(--color-border)]">
          {data.headers.map((header, index) => (
            <th key={index} className="text-left py-2 font-semibold">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, index) => (
          <tr key={index} className="border-b border-[var(--color-border)]">
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="py-2">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
  blockquote: (props: BlockquoteProps) => (
    <blockquote
      className="border-l-2 border-[var(--color-muted)] pl-6 my-6 text-[var(--color-muted)] italic"
      {...props}
    />
  ),
  hr: () => <hr className="border-t border-[var(--color-border)] my-12" />,
};

declare global {
  type MDXProvidedComponents = typeof components;
}

export function useMDXComponents(): MDXProvidedComponents {
  return components;
}
