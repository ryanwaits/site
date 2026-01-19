'use client'

import { createContext, useContext, useState, useCallback, useEffect, useLayoutEffect, useRef, ReactNode } from 'react'

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
  const [showInterstellar, setShowInterstellar] = useState(false)

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
      case 'interstellar':
        setShowInterstellar(true)
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
      {showMatrix && <MatrixRain theme={theme} onComplete={() => setShowMatrix(false)} />}

      {/* Interstellar Effect */}
      {showInterstellar && <InterstellarEffect onComplete={() => setShowInterstellar(false)} />}
    </SiteEffectsContext.Provider>
  )
}

function MatrixRain({ theme, onComplete }: { theme: 'light' | 'dark'; onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [phase, setPhase] = useState<'fade-in' | 'running' | 'fade-out'>('fade-in')
  const [opacity, setOpacity] = useState(0)

  const isDark = theme === 'dark'

  // Play audio on mount
  useEffect(() => {
    const audio = new Audio('/audio/spybreak.mp3')
    audio.volume = 0.7
    audioRef.current = audio
    audio.play().catch(() => {}) // Ignore autoplay restrictions

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

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

    // Dark: classic Matrix green on black | Light: muted greens on cream
    const colors = isDark
      ? ['#00ff41', '#008f11', '#00b33c', '#003b00', '#00ff41']
      : ['#5a9848', '#8ab878', '#2d7828', '#b8c8a0', '#d4d4b8']
    const leadColor = isDark ? '#ffffff' : '#e8e4d9'
    const bgColor = isDark ? 'rgba(0, 0, 0, 0.08)' : 'rgba(232, 228, 217, 0.08)'

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
  }, [isDark])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[100] pointer-events-none transition-opacity duration-300"
      style={{
        opacity,
        mixBlendMode: isDark ? 'screen' : 'multiply',
      }}
    />
  )
}

function InterstellarEffect({ onComplete }: { onComplete: () => void }) {
  // Audio + timer
  useEffect(() => {
    const audio = new Audio('/audio/interstellar.mp3')
    audio.volume = 0.7
    audio.play().catch(() => {})

    const timer = setTimeout(() => onComplete(), 10000)

    return () => {
      audio.pause()
      audio.src = ''
      clearTimeout(timer)
    }
  }, [onComplete])

  return (
    <>
      <style>{`
        @keyframes waveExpand {
          0% { width: 50px; height: 50px; opacity: 0.6; border-width: 2px; }
          100% { width: 600px; height: 600px; opacity: 0; border-width: 0.5px; }
        }
        @keyframes diskRotate {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>

      <div className="fixed inset-0 z-[100] pointer-events-none">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="absolute rounded-full border border-amber-500/40"
            style={{
              left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
              width: '50px', height: '50px',
              animation: `waveExpand 3s ease-out ${i * 0.75}s infinite`,
            }}
          />
        ))}

        <div
          className="absolute"
          style={{
            left: '50%', top: '50%', width: '300px', height: '300px',
            transform: 'translate(-50%, -50%)', borderRadius: '50%',
            background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,147,41,0.15) 30deg, rgba(255,177,71,0.4) 90deg, rgba(255,197,101,0.6) 120deg, rgba(255,147,41,0.4) 180deg, transparent 210deg, rgba(255,127,21,0.3) 270deg, rgba(255,167,51,0.5) 300deg, transparent 360deg)',
            filter: 'blur(20px)', animation: 'diskRotate 20s linear infinite',
          }}
        />

        <div
          className="absolute bg-black rounded-full"
          style={{
            left: '50%', top: '50%', width: '120px', height: '120px',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 60px 30px rgba(0,0,0,1), 0 0 100px 60px rgba(0,0,0,0.8)',
          }}
        />
      </div>
    </>
  )
}


