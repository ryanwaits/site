'use client'

import { useState } from 'react'
import { SiteNav } from '../components/site-nav'
import { SiteFooter } from '../components/site-footer'
import { JOBS } from '@/lib/jobs'

function CommitLine({ job, isExpanded, onToggle }: { job: typeof JOBS[0]; isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="overflow-hidden font-mono text-sm">
      {/* Commit header */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[var(--color-muted)]">
        <span className="text-[var(--color-muted)]">commit</span>
        <span className="text-[var(--color-text)]">{job.hash}</span>
        {job.branch && (
          <span className="text-xs text-[var(--color-muted)]">({job.branch})</span>
        )}
      </div>
      <div className="text-[var(--color-muted)] mt-1 break-all">
        Author: {job.title.toLowerCase().replace(/\s+/g, '-')} {'<'}{job.email}{'>'}
      </div>
      <div className="text-[var(--color-muted)]">
        Date:   {job.period}
      </div>

      {/* Company - right under date */}
      <div className="text-[var(--color-muted)] text-xs">
        {'        '}@ {job.company}
      </div>

      {/* Stack - below company */}
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {job.stack.map((tech, i) => (
          <span
            key={i}
            className="text-xs px-1.5 py-0.5 border border-[var(--color-border)] text-[var(--color-muted)] rounded"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Commit message - clickable expand/collapse */}
      <button
        onClick={onToggle}
        className="mt-3 text-left cursor-pointer hover:opacity-70 transition-opacity duration-200"
      >
        <span className="text-[var(--color-text)] break-words">{job.message}</span>
      </button>

      {/* Diff - collapsible */}
      <div
        className={`mt-3 ml-2 md:ml-4 pl-3 md:pl-4 border-l border-[var(--color-border)] space-y-3 overflow-hidden transition-all duration-200 ${
          isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {/* Stats line */}
        <div className="text-[var(--color-muted)] text-xs pt-1">
          {job.additions.length} insertion{job.additions.length !== 1 ? 's' : ''}(+)
          {job.deletions.length > 0 && `, ${job.deletions.length} deletion${job.deletions.length !== 1 ? 's' : ''}(-)`}
        </div>

        {/* Diff content */}
        <div className="space-y-1 pb-1">
          {job.additions.map((line, i) => (
            <div key={i} className="flex gap-2">
              <span className="shrink-0 text-[var(--color-text)]">+</span>
              <span className="break-words text-[var(--color-text)] opacity-80">{line}</span>
            </div>
          ))}
          {job.deletions.map((line, i) => (
            <div key={i} className="flex gap-2">
              <span className="shrink-0 text-[var(--color-muted)]">-</span>
              <span className="line-through text-[var(--color-muted)]">{line}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function JobsPage() {
  const [expandedHash, setExpandedHash] = useState<string | null>(null)

  const toggleJob = (hash: string) => {
    setExpandedHash(prev => prev === hash ? null : hash)
  }

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
                  <div className="w-2 h-2 rounded-full bg-[var(--color-text)] opacity-40 mt-2 shrink-0" />
                  {i < JOBS.length - 1 && (
                    <div className="w-px flex-1 bg-[var(--color-border)] mt-1" />
                  )}
                </div>

                <CommitLine
                  job={job}
                  isExpanded={expandedHash === job.hash}
                  onToggle={() => toggleJob(job.hash)}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
