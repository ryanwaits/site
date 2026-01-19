import { type AnnotationHandler, highlight, Pre, type RawCode } from 'codehike/code';

import { flagsToOptions, theme } from './code.config';
import { CopyButton } from './code.copy';
import { getHandlers } from './code.handlers';

/**
 * Terminal-style code block inspired by OpenCode's design.
 * Features subtle gray dots and minimal styling.
 */
export async function Terminal(props: {
  codeblock: RawCode;
  handlers?: AnnotationHandler[];
}): Promise<React.JSX.Element> {
  const { codeblock, handlers: extraHandlers } = props;
  const { flags } = extractFlags(codeblock);
  const options = flagsToOptions(flags);

  const highlighted = await highlight({ ...codeblock, lang: codeblock.lang || 'bash' }, theme);

  const handlers = getHandlers(options);
  if (extraHandlers) {
    handlers.push(...extraHandlers);
  }

  const { background: _background, ...highlightedStyle } = highlighted.style;
  const showCopy = options?.copyButton !== false;

  return (
    <figure className="group relative my-4 not-prose overflow-hidden rounded-sm bg-dk-tabs-background">
      {/* Terminal header with subtle dots */}
      <figcaption className="relative flex h-8 items-center px-4">
        {/* Three subtle dots */}
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-dk-tab-inactive-foreground/40" />
          <div className="size-2.5 rounded-full bg-dk-tab-inactive-foreground/40" />
          <div className="size-2.5 rounded-full bg-dk-tab-inactive-foreground/40" />
        </div>
        <span className="sr-only">Terminal window</span>
      </figcaption>

      {/* Code content */}
      <Pre
        code={highlighted}
        className="overflow-auto m-0 rounded-none !bg-transparent selection:bg-dk-selection selection:text-current py-2 pr-12"
        style={highlightedStyle}
        handlers={handlers}
      />

      {/* Copy button */}
      {showCopy && (
        <CopyButton
          text={highlighted.code}
          variant="floating"
          className="absolute right-2 top-10 z-10 text-dk-tab-inactive-foreground"
        />
      )}
    </figure>
  );
}

function extractFlags(codeblock: RawCode) {
  const meta = codeblock.meta || '';
  const flagMatch = meta.split(' ').find((flag) => flag.startsWith('-'));
  const flags = flagMatch ? flagMatch.slice(1) : '';
  return { flags };
}
