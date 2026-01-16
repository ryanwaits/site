'use client'

import { useState } from 'react'

const SAMPLE_CARDS = [
  { english: "The check, please", spanish: "La cuenta, por favor" },
  { english: "Nice to meet you", spanish: "Mucho gusto" },
  { english: "Where is the bathroom?", spanish: "¿Dónde está el baño?" },
]

export function AmigoCard() {
  const [isFlipped, setIsFlipped] = useState(false)
  const [cardIndex, setCardIndex] = useState(0)

  const currentCard = SAMPLE_CARDS[cardIndex]

  const handleFlip = () => {
    if (isFlipped) {
      // Move to next card after seeing answer
      setTimeout(() => {
        setCardIndex((i) => (i + 1) % SAMPLE_CARDS.length)
      }, 150)
    }
    setIsFlipped(!isFlipped)
  }

  return (
    <div className="group relative">
      {/* Card container with perspective */}
      <div
        className="relative w-full aspect-[4/3] cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={handleFlip}
      >
        {/* The flipping card */}
        <div
          className="relative w-full h-full transition-transform duration-500 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* Front side - English */}
          <div
            className="absolute inset-0 rounded-lg overflow-hidden border border-[var(--color-border)]"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Paper texture background - soft white */}
            <div className="absolute inset-0 bg-[var(--console-outer-bg)]">
              {/* Subtle noise texture */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />
              {/* Subtle lined paper effect */}
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 23px, currentColor 24px)',
                  backgroundSize: '100% 24px',
                }}
              />
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
                  amigo
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 bg-[var(--color-accent)] text-white rounded-sm">
                  SPRINT
                </span>
              </div>

              {/* Question */}
              <div className="flex-1 flex items-center justify-center">
                <p className="text-center text-lg font-medium text-[var(--color-text)] leading-relaxed">
                  "{currentCard.english}"
                </p>
              </div>

              {/* Tap hint */}
              <div className="flex items-center justify-center gap-2 text-[var(--color-muted)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <span className="font-mono text-[10px] uppercase tracking-wider">
                  tap to reveal
                </span>
              </div>
            </div>
          </div>

          {/* Back side - Spanish */}
          <div
            className="absolute inset-0 rounded-lg overflow-hidden border border-[var(--color-border)]"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            {/* Paper texture background - soft white */}
            <div className="absolute inset-0 bg-[var(--console-outer-bg)]">
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
                  respuesta
                </span>
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#006847]" />
                  <span className="w-2 h-2 rounded-full bg-white border border-[var(--color-border)]" />
                  <span className="w-2 h-2 rounded-full bg-[#CE1126]" />
                </div>
              </div>

              {/* Answer */}
              <div className="flex-1 flex items-center justify-center">
                <p className="text-center text-lg font-medium text-[var(--color-accent)] leading-relaxed">
                  "{currentCard.spanish}"
                </p>
              </div>

              {/* Grade hint */}
              <div className="flex items-center justify-center gap-4">
                <span className="font-mono text-[10px] text-red-500/60">← hard</span>
                <span className="font-mono text-[10px] text-[var(--color-muted)]">tap for next</span>
                <span className="font-mono text-[10px] text-green-500/60">easy →</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="mt-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-[var(--color-muted)]">
            <span className="text-orange-500">🔥</span> 12 streak
          </span>
          <span className="font-mono text-xs text-[var(--color-muted)]">
            8 due
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)] opacity-60">
          Taqueria Sprint
        </span>
      </div>
    </div>
  )
}
