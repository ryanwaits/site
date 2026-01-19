export interface Job {
  hash: string;
  branch?: string;
  title: string;
  company: string;
  email: string;
  period: string;
  message: string;
  additions: string[];
  stack: string[];
  deletions: string[];
}

export const JOBS: Job[] = [
  {
    hash: 'a3f2d1e',
    branch: 'HEAD -> main',
    title: 'Developer Experience Designer/Engineer',
    company: 'Hiro',
    email: 'ryan@hiro.so',
    period: '2021 — 2024',
    message: 'feat(dx): designing developer tools for Bitcoin infrastructure',
    additions: [
      'Rearchitected docs system across 12+ packages and 10+ APIs — designed for automation and AI before it was obvious.',
      'Designed and built the Chainhooks CLI from scratch — owned the entire interaction model, error feedback, and progressive disclosure.',
      'Prototyped onboarding flows for event-streaming platform — UX workflows designed with atomic primitives for agent integration.',
      'Shaped developer experience with a team of one — every design decision had to scale without me.',
    ],
    stack: ['TypeScript', 'Next.js', 'Bun', 'Fastify', 'Redis', 'SQL'],
    deletions: [],
  },
  {
    hash: 'c9d8f3b',
    title: 'Head of Engineering',
    company: 'RabbitHole',
    email: 'ryan@rabbithole.gg',
    period: '2021 — 2021',
    message: 'feat(web3): quest platform, onboarding infrastructure',
    additions: [
      'Designed and shipped product features for web3 onboarding.',
      'Led frontend migration to Next.js — improved performance and DX.',
      'Integrated with The Graph for real-time web3 data.',
    ],
    stack: ['TypeScript', 'Next.js', 'GraphQL', 'The Graph', 'Solidity', 'Postgres'],
    deletions: [],
  },
  {
    hash: 'e2f1a4c',
    title: 'Lead Engineer',
    company: 'Sweep',
    email: 'ryan@sweep.chat',
    period: '2018 — 2020',
    message: 'feat(chat): conversational interfaces before LLMs',
    additions: [
      'Designed chatbot experiences for Anheuser-Busch across MLB and NFL — conversational UI before it was mainstream.',
      'Shipped Bud Light March Madness campaign — real-time game predictions, ticket giveaways, 100k+ users.',
      'Bet on chat as the next platform. Turned out to be right, just early.',
    ],
    stack: ['Ruby', 'Rails', 'Node.js', 'Redis', 'Sidekiq', 'Postgres', 'Facebook Messenger API'],
    deletions: ['native apps', 'traditional UI'],
  },
  {
    hash: 'f5e6d7a',
    title: 'Software Developer',
    company: 'Sonic Healthcare USA',
    email: 'ryan@sonichealthcare.com',
    period: '2016 — 2018',
    message: 'init: healthcare technology foundation',
    additions: [
      'Built enterprise software for healthcare and laboratory services.',
      'Learned how to ship in regulated environments.',
    ],
    stack: ['Ruby', 'Rails', 'JavaScript', 'Postgres'],
    deletions: [],
  },
];
