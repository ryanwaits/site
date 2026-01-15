'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react'

interface SiteEffectsContextType {
  theme: 'light' | 'dark'
  cursor: string
  animationsEnabled: boolean
  handleCommand: (action: string, value: string) => void
}

const SiteEffectsContext = createContext<SiteEffectsContextType | null>(null)

export function useSiteEffects() {
  const context = useContext(SiteEffectsContext)
  if (!context) throw new Error('useSiteEffects must be used within SiteEffectsProvider')
  return context
}

export function SiteEffectsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme')
      if (stored === 'dark' || stored === 'light') return stored
      // Fall back to system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
    }
    return 'light'
  })
  const [cursor, setCursor] = useState('default')
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [showMatrix, setShowMatrix] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const handleCommand = useCallback((action: string, value: string) => {
    switch (action) {
      case 'theme':
        setTheme(value as 'light' | 'dark')
        localStorage.setItem('theme', value)
        break
      case 'cursor':
        setCursor(value)
        break
      case 'animate':
        setAnimationsEnabled(value === 'on')
        break
      case 'matrix':
        setShowMatrix(true)
        break
      case 'confetti':
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
        break
      case 'music':
        console.log('Music:', value)
        break
    }
  }, [])

  // Apply theme - set explicit class to override system preference
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(theme)
  }, [theme])

  // Apply cursor
  useEffect(() => {
    document.body.style.cursor = cursor
  }, [cursor])

  return (
    <SiteEffectsContext.Provider value={{ theme, cursor, animationsEnabled, handleCommand }}>
      {children}

      {/* Matrix Rain Effect */}
      {showMatrix && <MatrixRain onComplete={() => setShowMatrix(false)} />}

      {/* Confetti Effect */}
      {showConfetti && <Confetti />}
    </SiteEffectsContext.Provider>
  )
}

function MatrixRain({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [phase, setPhase] = useState<'fade-in' | 'running' | 'fade-out'>('fade-in')
  const [opacity, setOpacity] = useState(0)

  useEffect(() => {
    // Phase timing: fade-in (1.5s) -> running (4s) -> fade-out (1.5s)
    const fadeInTimer = setTimeout(() => setPhase('running'), 1500)
    const runTimer = setTimeout(() => setPhase('fade-out'), 5500)
    const completeTimer = setTimeout(() => onComplete(), 7000)

    return () => {
      clearTimeout(fadeInTimer)
      clearTimeout(runTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  // Handle opacity based on phase
  useEffect(() => {
    let animationFrame: number
    const animate = () => {
      setOpacity(prev => {
        if (phase === 'fade-in') {
          return Math.min(prev + 0.02, 0.85)
        } else if (phase === 'fade-out') {
          return Math.max(prev - 0.02, 0)
        }
        return prev
      })
      animationFrame = requestAnimationFrame(animate)
    }
    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [phase])

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const colors = ['#5a9848', '#8ab878', '#2d7828', '#b8c8a0', '#d4d4b8']
    const leadColor = '#e8e4d9'
    const bgColor = 'rgba(232, 228, 217, 0.08)'

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>/{}[]'
    const fontSize = 14
    const columns = Math.floor(canvas.width / fontSize)

    // Initialize drops with staggered start positions
    const drops: { y: number; speed: number; color: string; char: string }[] = []
    for (let i = 0; i < columns; i++) {
      drops.push({
        y: Math.random() * -100, // Start above screen at random heights
        speed: 0.5 + Math.random() * 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        char: chars[Math.floor(Math.random() * chars.length)],
      })
    }

    let frameCount = 0

    function draw() {
      // Semi-transparent overlay that lets page show through
      ctx!.fillStyle = bgColor
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height)

      ctx!.font = `${fontSize}px "JetBrains Mono", monospace`

      for (let i = 0; i < drops.length; i++) {
        const drop = drops[i]

        // Only draw if drop is on screen
        if (drop.y > 0) {
          // Bright leading character
          ctx!.fillStyle = leadColor
          ctx!.fillText(drop.char, i * fontSize, drop.y * fontSize)

          // Trail with varying opacity
          for (let j = 1; j < 15; j++) {
            const trailY = drop.y - j
            if (trailY > 0) {
              const trailOpacity = 1 - (j / 15)
              ctx!.fillStyle = drop.color + Math.floor(trailOpacity * 255).toString(16).padStart(2, '0')
              const trailChar = chars[Math.floor(Math.random() * chars.length)]
              ctx!.fillText(trailChar, i * fontSize, trailY * fontSize)
            }
          }
        }

        // Move drop down
        drop.y += drop.speed

        // Reset when off screen
        if (drop.y * fontSize > canvas!.height + 200) {
          drop.y = Math.random() * -50
          drop.speed = 0.5 + Math.random() * 1.5
          drop.color = colors[Math.floor(Math.random() * colors.length)]
          drop.char = chars[Math.floor(Math.random() * chars.length)]
        }

        // Occasionally change character
        if (Math.random() > 0.98) {
          drop.char = chars[Math.floor(Math.random() * chars.length)]
        }
      }

      frameCount++
    }

    const interval = setInterval(draw, 40)

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[100] pointer-events-none transition-opacity duration-300"
      style={{
        opacity,
        mixBlendMode: 'multiply',
      }}
    />
  )
}

function Confetti() {
  const [particles, setParticles] = useState<Array<{
    id: number
    x: number
    y: number
    color: string
    rotation: number
    velocity: { x: number; y: number }
  }>>([])

  useEffect(() => {
    const colors = ['#5a9848', '#c9a85c', '#8ab878', '#e8e4d9', '#2d7828']
    const newParticles = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: -10,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      velocity: {
        x: (Math.random() - 0.5) * 10,
        y: Math.random() * 5 + 5,
      },
    }))
    setParticles(newParticles)

    const interval = setInterval(() => {
      setParticles(prev =>
        prev.map(p => ({
          ...p,
          x: p.x + p.velocity.x,
          y: p.y + p.velocity.y,
          rotation: p.rotation + 5,
          velocity: { ...p.velocity, y: p.velocity.y + 0.2 },
        })).filter(p => p.y < window.innerHeight + 100)
      )
    }, 16)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute w-3 h-3"
          style={{
            left: p.x,
            top: p.y,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  )
}
