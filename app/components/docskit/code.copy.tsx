'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function CopyButton({
  text,
  className,
  variant = 'floating',
}: {
  text: string;
  className?: string;
  variant?: 'floating' | 'inline';
}): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className={cn(
        'cursor-pointer transition-opacity duration-200',
        variant === 'floating' && [
          'size-8 flex items-center justify-center',
          'rounded-sm bg-dk-tabs-background hover:bg-dk-background',
          'opacity-0 group-hover:opacity-100',
        ],
        variant === 'inline' && 'rounded-sm',
        className,
      )}
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      title="Copy to clipboard"
      aria-label="Copy to clipboard"
    >
      {copied ? <Check size={16} className="block" /> : <Copy size={16} className="block" />}
    </button>
  );
}
