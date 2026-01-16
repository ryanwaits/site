'use client'

import { ReactNode } from 'react'

interface TerminalFrameProps {
  title?: string
  children: ReactNode
  className?: string
  showControls?: boolean
  compact?: boolean
}

/**
 * Unified terminal frame component matching console.tsx styling.
 * Uses CSS variables: --console-outer-bg, --console-content-bg,
 * --console-text, --console-muted, --console-accent
 */
export function TerminalFrame({
  title = 'terminal',
  children,
  className = '',
  showControls = true,
  compact = false,
}: TerminalFrameProps) {
  return (
    <div className={`font-mono text-xs ${className}`}>
      {/* Outer Frame */}
      <div className="flex flex-col bg-[var(--console-outer-bg)] border border-[var(--color-text)] p-1">

        {/* Title Bar */}
        {showControls && (
          <div className={`flex items-center gap-3 px-1 ${compact ? 'py-0.5' : 'py-1'}`}>
            {/* Terminal Icon - pixelated */}
            <div className="p-0.5 text-[var(--color-text)]">
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M11 0H1V1H0V11H1V12H11V11H12V1H11V0ZM11 1V11H1V1H11ZM6 7H10V8H6V7ZM3 7H2V8H3V7ZM4 6V7H3V6H4ZM4 5V6H5V5H4ZM3 4H4V5H3V4ZM3 4V3H2V4H3Z" fill="currentColor"/>
              </svg>
            </div>

            {/* Horizontal line */}
            <div className="flex-1 h-px bg-[var(--color-muted)]" />

            {/* Title Label */}
            <span className="text-[10px] text-[var(--color-text)] tracking-[0.15em] uppercase font-medium whitespace-nowrap">
              [ {title} ]
            </span>

            {/* Horizontal line */}
            <div className="flex-1 h-px bg-[var(--color-muted)]" />
          </div>
        )}

        {/* Inner Content Frame */}
        <div className="border border-[var(--color-text)] bg-[var(--console-content-bg)] overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * Terminal content styling helpers
 */
export const terminalColors = {
  command: 'text-[#58a6ff]',      // $ commands
  success: 'text-[#3fb950]',      // ✓ success
  warning: 'text-[#f0883e]',      // ⚠ warnings, ◐ loading
  error: 'text-[#f85149]',        // errors
  link: 'text-[#a371f7]',         // → links/outputs
  comment: 'text-[var(--console-muted)]',  // // comments
  text: 'text-[var(--console-text)]',      // default text
  accent: 'text-[var(--console-accent)]',  // orange accent
  muted: 'text-[var(--console-muted)]',    // muted gray
  border: 'text-[#30363d]',       // box drawing chars
}

/**
 * Get appropriate color class for a terminal line
 */
export function getLineColor(line: string): string {
  if (line.startsWith('$')) return terminalColors.command
  if (line.startsWith('◐')) return terminalColors.warning
  if (line.startsWith('✓')) return terminalColors.success
  if (line.startsWith('⚠')) return terminalColors.warning
  if (line.startsWith('→')) return terminalColors.link
  if (line.startsWith('//') || line.startsWith('#')) return terminalColors.comment
  if (line.includes('│') || line.includes('┌') || line.includes('└') || line.includes('├') || line.includes('─')) {
    return terminalColors.border
  }
  return terminalColors.text
}
