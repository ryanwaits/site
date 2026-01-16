'use client'

import { useState, useEffect } from 'react'
import { TerminalFrame } from '../../components/terminal-frame'

// Simulated flux data - in production this could be fetched from an API
const FLUX_DATA = {
  focus: "Career transition",
  focusDetail: "Evaluating: Anthropic, Gauntlet, Indie",
  activeProjects: ["site", "doccov", "openpkg"],
  todaySessions: 3,
  recentActivity: [
    { time: "09:41", project: "site", action: "session started" },
    { time: "08:22", area: "tasks", action: "2 items completed" },
    { time: "08:05", area: "sparks", action: "new idea captured" },
  ],
  mood: 7,
  energy: 6,
}

export function FluxCard() {
  const [showTerminal, setShowTerminal] = useState(false)
  const [terminalLines, setTerminalLines] = useState<string[]>([])

  // Typewriter effect for terminal
  useEffect(() => {
    if (showTerminal && terminalLines.length < FLUX_DATA.recentActivity.length) {
      const timer = setTimeout(() => {
        const activity = FLUX_DATA.recentActivity[terminalLines.length]
        const line = `[${activity.time}] ${activity.project || activity.area} — ${activity.action}`
        setTerminalLines(prev => [...prev, line])
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [showTerminal, terminalLines])

  const handleToggleView = () => {
    setShowTerminal(!showTerminal)
    if (!showTerminal) {
      setTerminalLines([])
    }
  }

  return (
    <div className="group relative">
      <TerminalFrame title="flux" compact>
        <div className="relative aspect-[4/3]">
          {/* Graph nodes visualization - background decoration */}
          <svg
            className="absolute inset-0 w-full h-full opacity-20"
            viewBox="0 0 200 150"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Connection lines */}
            <line x1="100" y1="75" x2="45" y2="35" stroke="var(--console-accent)" strokeWidth="0.5" opacity="0.4" />
            <line x1="100" y1="75" x2="155" y2="45" stroke="var(--console-accent)" strokeWidth="0.5" opacity="0.4" />
            <line x1="100" y1="75" x2="50" y2="115" stroke="var(--console-accent)" strokeWidth="0.5" opacity="0.4" />
            <line x1="100" y1="75" x2="160" y2="110" stroke="var(--console-accent)" strokeWidth="0.5" opacity="0.4" />

            {/* Nodes */}
            <circle cx="100" cy="75" r="6" fill="var(--console-accent)" opacity="0.6">
              <animate attributeName="opacity" values="0.6;0.9;0.6" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="45" cy="35" r="3" fill="var(--console-muted)" opacity="0.4" />
            <circle cx="155" cy="45" r="3" fill="var(--console-muted)" opacity="0.4" />
            <circle cx="50" cy="115" r="3" fill="var(--console-muted)" opacity="0.4" />
            <circle cx="160" cy="110" r="3" fill="var(--console-muted)" opacity="0.4" />
          </svg>

          {/* Content */}
          <div className="relative h-full flex flex-col p-4 text-[var(--console-text)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[var(--console-muted)]">
                  obsidian vault
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-green-500/80">synced</span>
              </div>
            </div>

            {/* Main content - switches between dashboard and terminal */}
            <div className="flex-1 flex flex-col justify-center">
              {!showTerminal ? (
                /* Dashboard view */
                <div className="space-y-3">
                  {/* Focus */}
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--console-muted)] block mb-1">
                      Current Focus
                    </span>
                    <span className="text-sm text-[var(--console-accent)]">
                      {FLUX_DATA.focus}
                    </span>
                  </div>

                  {/* Stats row */}
                  <div className="flex gap-6">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[var(--console-muted)] block mb-1">
                        Today
                      </span>
                      <span className="text-sm text-[var(--console-text)]">
                        {FLUX_DATA.todaySessions} sessions
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[var(--console-muted)] block mb-1">
                        Energy
                      </span>
                      <div className="flex gap-0.5">
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-3 rounded-sm ${
                              i < FLUX_DATA.energy ? 'bg-[var(--console-accent)]' : 'bg-[var(--color-border)]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Active projects */}
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--console-muted)] block mb-1">
                      Active
                    </span>
                    <div className="flex gap-2">
                      {FLUX_DATA.activeProjects.map((project) => (
                        <span
                          key={project}
                          className="text-[10px] px-1.5 py-0.5 bg-[var(--color-border)] text-[var(--console-text)] rounded"
                        >
                          {project}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Terminal view */
                <div className="space-y-1">
                  <div className="text-[var(--console-muted)]">$ flux status</div>
                  <div className="text-[var(--console-muted)] mb-2">─────────────────────────</div>
                  {terminalLines.map((line, i) => (
                    <div key={i} className="text-[var(--console-text)]">{line}</div>
                  ))}
                  {terminalLines.length < FLUX_DATA.recentActivity.length && (
                    <span className="inline-block w-2 h-3 bg-[var(--console-accent)] animate-pulse" />
                  )}
                  {terminalLines.length === FLUX_DATA.recentActivity.length && (
                    <div className="text-[var(--console-muted)] mt-2">
                      <span className="inline-block w-2 h-3 bg-[var(--console-text)]/60 animate-pulse" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer - view toggle */}
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={handleToggleView}
                className="text-[10px] uppercase tracking-wider text-[var(--console-muted)] hover:text-[var(--console-text)] transition-colors"
              >
                {showTerminal ? '← dashboard' : 'view log →'}
              </button>
              <span className="text-[10px] text-[var(--console-muted)]/60">
                ~/flux
              </span>
            </div>
          </div>
        </div>
      </TerminalFrame>

      {/* Stats bar */}
      <div className="mt-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-[var(--color-muted)]">
            7 files
          </span>
          <span className="font-mono text-xs text-[var(--color-muted)]">
            5 areas
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)] opacity-60">
          Claude Code Integrated
        </span>
      </div>
    </div>
  )
}
