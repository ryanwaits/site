export interface Project {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  status: 'Stable' | 'MVP' | 'Beta' | 'Alpha';
  statusColor: string;
  github: string;
}

export const PROJECTS: Project[] = [
  {
    slug: 'openpkg-ts',
    name: 'openpkg-ts',
    tagline: 'OpenAPI for TypeScript packages',
    description: 'Extracts the public API from any TypeScript package. JSON Schema out. Wanted this to exist, so built it.',
    status: 'Stable',
    statusColor: '#73DACA',
    github: 'https://github.com/ryanwaits/openpkg-ts',
  },
  {
    slug: 'drift',
    name: 'drift',
    tagline: 'Your code changed. Your docs didn\'t.',
    description: 'Detect documentation drift in TypeScript projects. 21 commands that catch when JSDoc, examples, and markdown fall out of sync with your actual API.',
    status: 'Stable',
    statusColor: '#73DACA',
    github: 'https://github.com/ryanwaits/drift',
  },
  {
    slug: 'secondlayer',
    name: 'secondlayer',
    tagline: 'Developer infrastructure for Stacks',
    description: 'Full Stacks dev toolkit. Typed client, event indexer, SQL views on chain data, contract codegen — 10 packages.',
    status: 'Stable',
    statusColor: '#73DACA',
    github: 'https://github.com/ryanwaits/secondlayer',
  },
];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export function getProjectSlugs(): string[] {
  return PROJECTS.map((p) => p.slug);
}
