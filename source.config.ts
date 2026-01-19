import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { remarkCodeHike, recmaCodeHike, type CodeHikeConfig } from 'codehike/mdx';

const chConfig: CodeHikeConfig = {
  components: {
    code: 'DocsKitCode',
    inlineCode: 'DocsKitInlineCode',
  },
};

export const docs = defineDocs({
  dir: 'content',
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: (v) => [[remarkCodeHike, chConfig], ...v],
    recmaPlugins: [[recmaCodeHike, chConfig]],
  },
});
