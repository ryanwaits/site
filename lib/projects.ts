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
    slug: 'openpkg',
    name: 'openpkg',
    tagline: 'OpenAPI for TypeScript packages',
    description: 'Extracts the public API from any TypeScript package. JSON Schema out. Wanted this to exist, so built it.',
    status: 'Stable',
    statusColor: '#73DACA',
    github: 'https://github.com/ryanwaits/openpkg',
  },
  {
    slug: 'doccov',
    name: 'doccov',
    tagline: 'Codecov for documentation',
    description: 'Documentation coverage. Started as 2000 lines of TypeScript, now 100 lines of prompts. Deleted 95% of the code. Tool got better.',
    status: 'MVP',
    statusColor: '#F6833B',
    github: 'https://github.com/ryanwaits/doccov',
  },
  {
    slug: 'secondlayer',
    name: 'secondlayer',
    tagline: 'Type-safe Clarity contract interfaces',
    description: 'Generates TypeScript interfaces, helpers, and React hooks from Clarity contracts. One command. No manual types.',
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
