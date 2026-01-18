'use client'

import { useState, useEffect } from 'react'

interface SandboxBootProps {
  stage?: 'idle' | 'creating' | 'cloning' | 'installing' | 'ready' | 'error'
}

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

// Map backend stages to progress percentage
// Note: 'ready' never renders this component - it just disappears
const STAGE_PROGRESS: Record<string, number> = {
  creating: 20,
  cloning: 50,
  installing: 85,
}

export function SandboxBoot({ stage = 'creating' }: SandboxBootProps) {
  const [spinnerFrame, setSpinnerFrame] = useState(0)
  const [displayProgress, setDisplayProgress] = useState(0)

  // Spinner animation
  useEffect(() => {
    const interval = setInterval(() => {
      setSpinnerFrame(prev => (prev + 1) % SPINNER_FRAMES.length)
    }, 80)
    return () => clearInterval(interval)
  }, [])

  // Smooth progress animation toward target
  useEffect(() => {
    const target = STAGE_PROGRESS[stage] || 0

    const interval = setInterval(() => {
      setDisplayProgress(prev => {
        if (prev < target) {
          // Move toward target, faster when further away
          const diff = target - prev
          const step = Math.max(1, Math.floor(diff / 10))
          return Math.min(prev + step, target)
        }
        return prev
      })
    }, 50)

    return () => clearInterval(interval)
  }, [stage])

  // Build progress bar (34 chars wide)
  const barWidth = 34
  const filledWidth = Math.floor((displayProgress / 100) * barWidth)
  const emptyWidth = barWidth - filledWidth
  const progressBar = '▓'.repeat(filledWidth) + '░'.repeat(emptyWidth)

  return (
    <div className="font-mono text-xs leading-relaxed">
      <div className="text-[var(--color-muted)] mb-3">
        <span className="text-amber-500">{SPINNER_FRAMES[spinnerFrame]}</span>
        <span className="ml-2">Initializing agent...</span>
      </div>

      <div className="text-amber-500/80 text-[10px]">
        <div>┌──────────────────────────────────────┐</div>
        <div>│  {progressBar}  │</div>
        <div>└──────────────────────────────────────┘</div>
      </div>
    </div>
  )
}
