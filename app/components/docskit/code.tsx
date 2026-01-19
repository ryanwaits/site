import { type AnnotationHandler, highlight, Pre, type RawCode } from 'codehike/code';

import { cn } from '@/lib/utils';
import { type CodeInfo, flagsToOptions, theme } from './code.config';
import { CopyButton } from './code.copy';
import { getHandlers } from './code.handlers';
import { CodeIcon } from './code.icon';
import { Terminal } from './code.terminal';

/**
 * Main DocsKit code component with smart routing.
 * Routes to Terminal for bash/shell, otherwise renders as standard code block.
 */
export async function DocsKitCode(props: {
  codeblock: RawCode;
  handlers?: AnnotationHandler[];
  className?: string;
}): Promise<React.JSX.Element> {
  const { codeblock, className, ...rest } = props;
  const lang = codeblock.lang?.toLowerCase();

  // Route terminal/bash/shell to Terminal component
  if (lang === 'terminal' || lang === 'bash' || lang === 'sh' || lang === 'shell') {
    return <Terminal codeblock={codeblock} handlers={rest.handlers} />;
  }

  const group = await toCodeGroup({ codeblocks: [codeblock], ...rest });
  return <SingleCode group={group} className={className} />;
}

export async function SingleCode(props: {
  group: CodeInfo;
  className?: string;
}): Promise<React.JSX.Element> {
  const { pre, title, code, icon, options } = props.group.tabs[0];

  const showCopy = options?.copyButton;

  return (
    <figure
      className={cn(
        'group relative my-4 not-prose overflow-hidden rounded-sm bg-dk-tabs-background',
        props.className,
      )}
    >
      {title ? (
        <figcaption
          className={cn(
            'flex h-8 items-center px-4',
            'text-dk-tab-inactive-foreground text-sm font-mono',
          )}
        >
          <div className="flex items-center gap-2">
            <div className="size-4 opacity-60">{icon}</div>
            <span className="leading-none">{title}</span>
          </div>
        </figcaption>
      ) : null}
      <div className="relative">
        {pre}
        {showCopy && (
          <CopyButton
            text={code}
            variant="floating"
            className="absolute right-2 top-3 z-10 text-dk-tab-inactive-foreground"
          />
        )}
      </div>
    </figure>
  );
}

export async function toCodeGroup(props: {
  codeblocks: RawCode[];
  flags?: string;
  storage?: string;
  handlers?: AnnotationHandler[];
}): Promise<CodeInfo> {
  const rawFlags = props.flags?.startsWith('-') ? props.flags.slice(1) : props.flags;
  const groupOptions = flagsToOptions(rawFlags);

  const tabs = await Promise.all(
    props.codeblocks.map(async (tab) => {
      const { flags, title } = extractFlags(tab);
      const tabOptions = flagsToOptions(flags);
      const options = { ...groupOptions, ...tabOptions };

      const highlighted = await highlight({ ...tab, lang: tab.lang || 'txt' }, theme);
      const handlers = getHandlers(options);
      if (props.handlers) {
        handlers.push(...props.handlers);
      }
      const { background: _background, ...highlightedStyle } = highlighted.style;
      return {
        options,
        title,
        code: highlighted.code,
        icon: <CodeIcon title={title} lang={tab.lang} className="opacity-60" />,
        lang: tab.lang,
        pre: (
          <Pre
            code={highlighted}
            className="overflow-auto py-2 m-0 rounded-none !bg-transparent selection:bg-dk-selection selection:text-current max-h-full flex-1"
            style={highlightedStyle}
            handlers={handlers}
          />
        ),
      };
    }),
  );

  return {
    storage: props.storage,
    options: groupOptions,
    tabs,
  };
}

function extractFlags(codeblock: RawCode) {
  const flags = codeblock.meta.split(' ').filter((flag) => flag.startsWith('-'))[0] ?? '';
  const metaWithoutFlags = !flags
    ? codeblock.meta
    : codeblock.meta === flags
      ? ''
      : codeblock.meta.replace(` ${flags}`, '').trim();
  const title = metaWithoutFlags.trim();
  return { title, flags: flags.slice(1) };
}
