import { SiteNav } from '../components/site-nav'
import { SiteFooter } from '../components/site-footer'

const JOBS = [
  {
    hash: 'a3f2d1e',
    branch: 'HEAD -> main',
    title: 'DevRel/Developer Experience Engineer',
    company: 'Hiro',
    email: 'ryan@hiro.so',
    period: '2023 — 2026',
    message: 'feat(dx): chainhooks cli, docs platform, clarity adoption',
    additions: [
      'Built the Chainhooks CLI for local development — test webhook payloads without running a node/devnet/testnet/mainnet.',
      'Built features for Chainhooks v2 — block-specific queries, batch operations, filtering.',
      'Rebuilt docs platform with interactive code snippets and custom API reference pages.',
      'Shipped initiatives to improve Clarity smart contract language adoption.',
    ],
    stack: ['TypeScript', 'Next.js', 'Bun', 'Fastify', 'Redis', 'SQL'],
    deletions: [],
  },
  {
    hash: 'c9d8f3b',
    title: 'Head of Engineering',
    company: 'RabbitHole',
    email: 'ryan@rabbithole.gg',
    period: '2021 — 2022',
    message: 'feat(web3): quest platform, onboarding infrastructure',
    additions: [
      'Built backend services and migrated frontend to Next.js',
      'Designed and shipped new product features',
      'Integrated with The Graph for web3 indexing',
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
      'Built chatbot games on FB Messenger for Anheuser-Busch sponsors across MLB and NFL.',
      'Shipped Bud Light March Madness campaign — users predicted in-game events to win tickets and prizes.',
      'Bet on chat as the next platform — before GPT made it obvious.',
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
      'Enterprise software development',
      'Healthcare technology and laboratory services',
    ],
    stack: ['Ruby', 'Rails', 'JavaScript', 'Postgres'],
    deletions: [],
  },
]

function CommitLine({ job }: { job: typeof JOBS[0] }) {
  return (
    <div className="overflow-hidden">
      {/* Commit header */}
      <div className="font-mono text-sm">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[var(--color-muted)]">
          <span style={{ color: 'var(--color-commit)' }}>commit</span>
          <span style={{ color: 'var(--color-commit-hash)' }}>{job.hash}</span>
          {job.branch && (
            <span className="text-xs" style={{ color: 'var(--color-commit-branch)' }}>({job.branch})</span>
          )}
        </div>
        <div className="text-[var(--color-muted)] mt-1 break-all">
          Author: {job.title.toLowerCase().replace(/\s+/g, '-')} {'<'}{job.email}{'>'}
        </div>
        <div className="text-[var(--color-muted)]">
          Date:   {job.period}
        </div>
        <div className="mt-2 text-[var(--color-text)] break-words">
          {'    '}{job.message}
        </div>
        <div className="mt-1 text-[var(--color-muted)] text-xs">
          {'    '}@ {job.company}
        </div>
      </div>

      {/* Diff */}
      <div className="mt-3 ml-2 md:ml-4 pl-3 md:pl-4 border-l border-[var(--color-border)] font-mono text-sm space-y-3">
        {/* Stats line */}
        <div className="text-[var(--color-muted)] text-xs">
          {job.additions.length} insertion{job.additions.length !== 1 ? 's' : ''}(+)
          {job.deletions.length > 0 && `, ${job.deletions.length} deletion${job.deletions.length !== 1 ? 's' : ''}(-)`}
        </div>

        {/* Diff content */}
        <div className="space-y-1">
          {job.additions.map((line, i) => (
            <div key={i} className="flex gap-2">
              <span className="shrink-0" style={{ color: 'var(--color-diff-add)' }}>+</span>
              <span className="break-words" style={{ color: 'var(--color-diff-add)', opacity: 0.9 }}>{line}</span>
            </div>
          ))}
          {job.deletions.map((line, i) => (
            <div key={i} className="flex gap-2">
              <span className="shrink-0" style={{ color: 'var(--color-diff-del)' }}>-</span>
              <span className="line-through opacity-70 break-words" style={{ color: 'var(--color-diff-del)' }}>{line}</span>
            </div>
          ))}
        </div>

        {/* Stack */}
        <div className="pt-2 border-t border-[var(--color-border)]">
          <div className="text-[var(--color-muted)] text-xs mb-1">stack/</div>
          <div className="flex flex-wrap gap-2">
            {job.stack.map((tech, i) => (
              <span
                key={i}
                className="text-xs px-1.5 py-0.5 bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] rounded"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function JobsPage() {
  return (
    <div className="h-screen flex flex-col bg-[var(--color-bg)]">
      <SiteNav />
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-2xl md:ml-[72px]">
          {/* Git log entries */}
          <div className="space-y-6">
            {JOBS.map((job, i) => (
              <div key={job.hash} className="relative pl-6 md:pl-8">
                {/* Graph line */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col items-center w-4">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 shrink-0" />
                  {i < JOBS.length - 1 && (
                    <div className="w-px flex-1 bg-[var(--color-border)] mt-1" />
                  )}
                </div>

                <CommitLine job={job} />
              </div>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
