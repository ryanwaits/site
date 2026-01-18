'use client'

import { useState, useEffect, useCallback } from 'react'

interface SandboxBootProps {
  onReady?: () => void
  stage?: 'idle' | 'creating' | 'cloning' | 'installing' | 'ready' | 'error'
}

const BOOT_STAGES = [
  { id: 'creating', text: 'INITIALIZING SANDBOX ENVIRONMENT', duration: 2000 },
  { id: 'cloning', text: 'CLONING REPOSITORY', duration: 3000 },
  { id: 'installing', text: 'INSTALLING DEPENDENCIES', duration: 8000 },
  { id: 'ready', text: 'ENVIRONMENT READY', duration: 500 },
]

const ASCII_FRAMES = [
  `
   ┌──────────────────────────────────────┐
   │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
   └──────────────────────────────────────┘`,
  `
   ┌──────────────────────────────────────┐
   │  ▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░  │
   └──────────────────────────────────────┘`,
  `
   ┌──────────────────────────────────────┐
   │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░  │
   └──────────────────────────────────────┘`,
  `
   ┌──────────────────────────────────────┐
   │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░  │
   └──────────────────────────────────────┘`,
  `
   ┌──────────────────────────────────────┐
   │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
   └──────────────────────────────────────┘`,
]

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

export function SandboxBoot({ onReady, stage: externalStage }: SandboxBootProps) {
  const [lines, setLines] = useState<string[]>([])
  const [currentStageIndex, setCurrentStageIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [spinnerFrame, setSpinnerFrame] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [showCursor, setShowCursor] = useState(true)

  // Map external stage to index
  useEffect(() => {
    if (externalStage) {
      const idx = BOOT_STAGES.findIndex(s => s.id === externalStage)
      if (idx !== -1) setCurrentStageIndex(idx)
    }
  }, [externalStage])

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 530)
    return () => clearInterval(interval)
  }, [])

  // Spinner animation
  useEffect(() => {
    const interval = setInterval(() => {
      setSpinnerFrame(prev => (prev + 1) % SPINNER_FRAMES.length)
    }, 80)
    return () => clearInterval(interval)
  }, [])

  // Typewriter effect for adding lines
  const typewriterAdd = useCallback((text: string) => {
    setIsTyping(true)
    let i = 0
    const chars = text.split('')

    const typeInterval = setInterval(() => {
      if (i < chars.length) {
        setLines(prev => {
          const newLines = [...prev]
          if (newLines.length === 0 || i === 0) {
            newLines.push(chars[i])
          } else {
            newLines[newLines.length - 1] += chars[i]
          }
          return newLines
        })
        i++
      } else {
        clearInterval(typeInterval)
        setIsTyping(false)
      }
    }, 15)

    return () => clearInterval(typeInterval)
  }, [])

  // Boot sequence
  useEffect(() => {
    // Initial boot message
    const bootLines = [
      'CLAUDE AGENT SDK v0.2.7',
      'VERCEL SANDBOX RUNTIME',
      '════════════════════════════════════════',
      '',
    ]
    setLines(bootLines)

    // Progress simulation for visual feedback
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const stage = BOOT_STAGES[currentStageIndex]
        if (!stage) return prev
        const increment = 100 / (stage.duration / 100)
        return Math.min(prev + increment, 100)
      })
    }, 100)

    return () => clearInterval(progressInterval)
  }, [currentStageIndex])

  // Handle stage transitions
  useEffect(() => {
    if (progress >= 100 && currentStageIndex < BOOT_STAGES.length - 1) {
      const stage = BOOT_STAGES[currentStageIndex]
      setLines(prev => [...prev, `[OK] ${stage.text}`])
      setProgress(0)
      setCurrentStageIndex(prev => prev + 1)
    } else if (progress >= 100 && currentStageIndex === BOOT_STAGES.length - 1) {
      setLines(prev => [...prev, '', '[READY] SANDBOX INITIALIZED', ''])
      onReady?.()
    }
  }, [progress, currentStageIndex, onReady])

  const currentStage = BOOT_STAGES[currentStageIndex]
  const progressBarIndex = Math.floor((progress / 100) * (ASCII_FRAMES.length - 1))

  return (
    <div className="font-mono text-xs leading-relaxed relative">
      {/* CRT scanline effect */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)',
        }}
      />

      {/* CRT flicker effect */}
      <div
        className="pointer-events-none absolute inset-0 z-10 animate-pulse opacity-[0.03]"
        style={{ background: 'var(--color-text)' }}
      />

      {/* Terminal output */}
      <div className="relative z-0 text-[var(--color-text)] opacity-90">
        {/* Boot header */}
        <pre className="text-[var(--color-muted)] mb-4">
{`
  ╔═══════════════════════════════════════╗
  ║     AGENT SANDBOX INITIALIZATION      ║
  ╚═══════════════════════════════════════╝
`}
        </pre>

        {/* Previous lines */}
        {lines.map((line, i) => (
          <div
            key={i}
            className={`${line.startsWith('[OK]') ? 'text-green-500' : ''} ${line.startsWith('[READY]') ? 'text-green-400 font-bold' : ''}`}
          >
            {line}
          </div>
        ))}

        {/* Current stage with spinner */}
        {currentStage && progress < 100 && (
          <div className="mt-2">
            <span className="text-amber-500">{SPINNER_FRAMES[spinnerFrame]}</span>
            <span className="ml-2 text-[var(--color-muted)]">{currentStage.text}...</span>
            <span className="ml-2 text-[var(--color-muted)]">{Math.floor(progress)}%</span>
          </div>
        )}

        {/* ASCII progress bar */}
        {currentStage && progress < 100 && (
          <pre className="text-amber-500/80 text-[10px] leading-tight mt-2">
            {ASCII_FRAMES[progressBarIndex]}
          </pre>
        )}

        {/* Blinking cursor */}
        <div className="mt-2 h-4">
          <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>
            {'>'} _
          </span>
        </div>
      </div>
    </div>
  )
}

// Simpler inline version for quick display
export function SandboxBootInline({ stage }: { stage: string }) {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(prev => (prev + 1) % SPINNER_FRAMES.length)
    }, 80)
    return () => clearInterval(interval)
  }, [])

  const stageText = {
    creating: 'Initializing sandbox',
    cloning: 'Cloning repository',
    installing: 'Installing dependencies',
    ready: 'Ready',
  }[stage] || stage

  if (stage === 'ready') {
    return (
      <span className="font-mono text-xs text-green-500">
        [OK] {stageText}
      </span>
    )
  }

  return (
    <span className="font-mono text-xs text-[var(--color-muted)]">
      <span className="text-amber-500">{SPINNER_FRAMES[frame]}</span>
      <span className="ml-2">{stageText}...</span>
    </span>
  )
}
