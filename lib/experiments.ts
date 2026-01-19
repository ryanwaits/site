export interface Experiment {
  id: string;
  name: string;
  tagline: string;
  description: string;
  links: {
    github?: string;
    post?: string;
  };
}

export interface ComingSoon {
  name: string;
  description: string;
}

export const EXPERIMENTS: Experiment[] = [
  {
    id: 'amigo',
    name: 'Amigo',
    tagline: 'Learn Spanish through real situations',
    description: 'Personalized flashcard sprints with spaced repetition. Train for specific scenarios — ordering at a taqueria, meeting someone\'s parents, traveling in Mexico.',
    links: {
      github: 'https://github.com/ryanwaits/amigo',
    },
  },
];

export const COMING_SOON: ComingSoon[] = [
  { name: 'doccov', description: 'Documentation coverage analysis' },
  { name: 'openpkg', description: 'TypeScript API extraction' },
];
