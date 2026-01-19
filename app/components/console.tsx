'use client'

import { useState, useEffect, useRef, useCallback, ComponentPropsWithoutRef } from 'react'
import { Streamdown } from 'streamdown'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import { highlight } from 'sugar-high'
import { viewComponents } from './view-components'
import type { Post } from '@/content/posts'

type SandboxStatus = 'idle' | 'creating' | 'cloning' | 'installing' | 'ready' | 'error'

interface ViewData {
  title: string
  mdx: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  activities?: Activity[]
  view?: ViewData
}

interface Activity {
  type: 'thinking' | 'tool' | 'skill' | 'system' | 'result'
  tool?: string
  detail?: string
}

interface WindowState {
  x: number
  y: number
  width: number
  height: number
}

const STORAGE_KEY = 'agent-window-state'
const DEFAULT_STATE: WindowState = { x: -1, y: -1, width: 560, height: 400 }
const MIN_SIZE = { width: 400, height: 300 }

// Hook to detect mobile viewport
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

// Simple welcome text
const WELCOME_TEXT = ``

// Custom markdown components - uses CSS variables for theming
const markdownComponents = {
  table: ({ children, ...props }: ComponentPropsWithoutRef<'table'>) => (
    <table {...props} className="console-table">
      {children}
    </table>
  ),
  thead: ({ children, ...props }: ComponentPropsWithoutRef<'thead'>) => (
    <thead {...props} className="console-thead">
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }: ComponentPropsWithoutRef<'tbody'>) => (
    <tbody {...props}>{children}</tbody>
  ),
  tr: ({ children, ...props }: ComponentPropsWithoutRef<'tr'>) => (
    <tr {...props} className="console-tr">
      {children}
    </tr>
  ),
  th: ({ children, ...props }: ComponentPropsWithoutRef<'th'>) => (
    <th {...props} className="console-th">
      {children}
    </th>
  ),
  td: ({ children, ...props }: ComponentPropsWithoutRef<'td'>) => (
    <td {...props} className="console-td">
      {children}
    </td>
  ),
  pre: ({ children, ...props }: ComponentPropsWithoutRef<'pre'>) => {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
      // Extract text from children (code element)
      let text = ''
      if (children && typeof children === 'object' && 'props' in children) {
        const codeProps = children.props as { children?: unknown }
        if (typeof codeProps.children === 'string') {
          text = codeProps.children
        }
      }
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }

    return (
      <div className="console-pre-wrapper group">
        <button
          onClick={handleCopy}
          className="console-copy-btn"
          aria-label="Copy code"
        >
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
        <pre {...props} className="console-pre">
          {children}
        </pre>
      </div>
    )
  },
  code: ({ children, className, ...props }: ComponentPropsWithoutRef<'code'>) => {
    // Extract string content - children might be string, [string], or React elements
    const content = typeof children === 'string'
      ? children
      : Array.isArray(children) && children.length === 1 && typeof children[0] === 'string'
        ? children[0]
        : null

    // Apply sugar-high highlighting for string content
    if (content) {
      const codeHTML = highlight(content)
      return (
        <code
          {...props}
          className="console-code-highlighted"
          dangerouslySetInnerHTML={{ __html: codeHTML }}
        />
      )
    }
    // Already processed by Shiki or complex content
    return (
      <code {...props} className={className || 'console-code'}>
        {children}
      </code>
    )
  },
}

// Braille spinner frames
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

// ASCII progress bar frames for header
const PROGRESS_FRAMES = [
  '░░░░░░░░',
  '█░░░░░░░',
  '██░░░░░░',
  '███░░░░░',
  '████░░░░',
  '█████░░░',
  '██████░░',
  '███████░',
  '████████',
]

function Spinner() {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % SPINNER_FRAMES.length)
    }, 80)
    return () => clearInterval(interval)
  }, [])

  return <span className="text-[var(--console-accent)]">{SPINNER_FRAMES[frame]}</span>
}

function HeaderProgress() {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % PROGRESS_FRAMES.length)
    }, 150)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className="text-[11px] text-[var(--color-text)] tracking-[0.05em] font-medium whitespace-nowrap font-mono">
      [ {PROGRESS_FRAMES[frame]} ]
    </span>
  )
}

function ActivityDisplay({ activities, isActive }: { activities: Activity[]; isActive: boolean }) {
  if (activities.length === 0 && !isActive) return null

  // Get icon and style based on activity type
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'thinking': return null // Uses spinner
      case 'system': return '⟩'
      case 'result': return '✓'
      case 'skill': return '◆'
      default: return '◇'
    }
  }

  const getActivityStyle = (type: Activity['type']) => {
    switch (type) {
      case 'result': return 'text-green-500'
      case 'system': return 'text-[var(--console-accent)]'
      default: return 'text-[var(--console-accent)]'
    }
  }

  return (
    <div className="pl-4 space-y-1 text-xs mb-2">
      {activities.map((activity, i) => (
        <div key={i} className="flex items-center gap-2 text-[var(--console-muted)]">
          {activity.type === 'thinking' ? (
            <>
              <Spinner />
              <span>Thinking...</span>
            </>
          ) : (
            <>
              <span className={getActivityStyle(activity.type)}>{getActivityIcon(activity.type)}</span>
              <span>{activity.tool}</span>
              {activity.detail && (
                <span className="opacity-60">{activity.detail}</span>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  )
}

// Inline view renderer for /view command output
function InlineView({ view }: { view: ViewData }) {
  const [compiled, setCompiled] = useState<MDXRemoteSerializeResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    serialize(view.mdx, { parseFrontmatter: false })
      .then(setCompiled)
      .catch(err => {
        console.error('MDX compile error:', err)
        setError('Failed to render view')
      })
  }, [view.mdx])

  if (error) {
    return <div className="text-red-600 text-xs">{error}</div>
  }

  if (!compiled) {
    return <div className="text-[var(--console-muted)] text-xs">Rendering...</div>
  }

  return (
    <div className="my-2">
      <div className="text-[10px] uppercase tracking-wider text-[var(--console-muted)] mb-2 font-mono">
        ◇ {view.title}
      </div>
      <div className="prose prose-sm max-w-none text-xs">
        <MDXRemote {...compiled} components={viewComponents} />
      </div>
    </div>
  )
}

interface ConsoleProps {
  onCommand?: (action: string, value: string) => void
  hideButton?: boolean
}

// Command registry with descriptions for typeahead
const COMMAND_REGISTRY: Array<{
  name: string
  description: string
  type: 'client'
  args?: string
}> = [
  { name: 'help', description: 'Show available commands', type: 'client' },
  { name: 'clear', description: 'Clear console history', type: 'client' },
  { name: 'theme', description: 'Change color theme', type: 'client', args: '<name>' },
  { name: 'effect', description: 'Visual effects', type: 'client', args: '<name>' },
  { name: 'view', description: 'Generate a custom view', type: 'client', args: '<prompt>' },
]

// Theme subcommands with visual hints
const THEME_REGISTRY: Array<{
  name: string
  description: string
  hint: string
}> = [
  { name: 'light', description: 'Light mode', hint: '○' },
  { name: 'dark', description: 'Dark mode', hint: '●' },
]

// Effect subcommands with visual hints
const EFFECT_REGISTRY: Array<{
  name: string
  description: string
  hint: string // ASCII/emoji visual hint
}> = [
  { name: 'matrix', description: 'Digital rain', hint: '░▒▓' },
  { name: 'interstellar', description: 'Gravitational waves', hint: '◠◡◠' },
]

// Client-side commands - bypass API for instant response
// Note: 'view' command is handled specially in sendMessage since it needs router
const CLIENT_COMMANDS: Record<string, (args: string, helpers: {
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  onCommand?: (action: string, value: string) => void
}) => string | null> = {
  help: () => {
    const effectList = EFFECT_REGISTRY.map(e => `\`${e.name}\``).join(', ')
    const themeList = THEME_REGISTRY.map(t => `\`${t.name}\``).join(', ')
    return `## Commands\n\n${COMMAND_REGISTRY.map(c => `- \`/${c.name}${c.args ? ' ' + c.args : ''}\` - ${c.description}`).join('\n')}\n\n**Themes:** ${themeList}\n\n**Effects:** ${effectList}\n\nOr just ask anything.`
  },

  clear: (_, { setMessages }) => {
    setMessages([])
    return null
  },

  theme: (args, { onCommand }) => {
    const themeName = args.trim().toLowerCase()
    const theme = THEME_REGISTRY.find(t => t.name.toLowerCase() === themeName)
    if (!theme) {
      const available = THEME_REGISTRY.map(t => `\`${t.name}\``).join(', ')
      return `Unknown theme. Available: ${available}`
    }
    onCommand?.('theme', theme.name)
    return `Switched to ${theme.name} mode.`
  },

  effect: (args, { onCommand }) => {
    const effectName = args.trim().toLowerCase()
    const effect = EFFECT_REGISTRY.find(e => e.name.toLowerCase() === effectName)
    if (!effect) {
      const available = EFFECT_REGISTRY.map(e => `\`${e.name}\``).join(', ')
      return `Unknown effect. Available: ${available}`
    }
    // Map effect name to action (normalize spaces to hyphens for the handler)
    const actionName = effect.name.replace(/\s+/g, '-')
    onCommand?.(actionName, 'on')
    // Return flavor text based on effect
    const flavorText: Record<string, string> = {
      'matrix': 'Wake up, Neo...',
      'interstellar': 'Do not go gentle into that good night.',
    }
    return flavorText[effect.name] || `${effect.name} activated.`
  },
}

export function Console({ onCommand, hideButton }: ConsoleProps) {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentActivities, setCurrentActivities] = useState<Activity[]>([])
  const [inputHistory, setInputHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [typeaheadIndex, setTypeaheadIndex] = useState(0)
  const [mentionTypeaheadIndex, setMentionTypeaheadIndex] = useState(0)
  const [effectTypeaheadIndex, setEffectTypeaheadIndex] = useState(0)
  const [themeTypeaheadIndex, setThemeTypeaheadIndex] = useState(0)
  const [posts, setPosts] = useState<Post[]>([])
  const [sandboxStatus, setSandboxStatus] = useState<SandboxStatus>('idle')

  // Fetch posts for @mention autocomplete
  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(setPosts)
      .catch(() => {})
  }, [])

  // Warmup sandbox when console opens
  useEffect(() => {
    if (!isOpen || sandboxStatus !== 'idle') return

    const warmup = async () => {
      setSandboxStatus('creating')
      try {
        const response = await fetch('/api/chat/warmup', { method: 'POST' })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        // Check if already ready (existing sandbox)
        const contentType = response.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          const data = await response.json()
          if (data.status === 'ready') {
            setSandboxStatus('ready')
            return
          }
        }

        // Stream progress updates
        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response body')

        const decoder = new TextDecoder()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.stage) {
                  setSandboxStatus(data.stage as SandboxStatus)
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      } catch (error) {
        console.error('Warmup error:', error)
        setSandboxStatus('error')
      }
    }

    warmup()
  }, [isOpen, sandboxStatus])

  // Compute filtered commands for typeahead
  const showTypeahead = input.startsWith('/') && !input.includes(' ')
  const typeaheadQuery = input.slice(1).toLowerCase()
  const filteredCommands = showTypeahead
    ? COMMAND_REGISTRY.filter(cmd => cmd.name.toLowerCase().startsWith(typeaheadQuery))
    : []

  // Compute @mention typeahead - detect @word pattern anywhere in input
  const mentionMatch = input.match(/@(\S*)$/)
  const showMentionTypeahead = mentionMatch !== null && !showTypeahead
  const mentionQuery = mentionMatch ? mentionMatch[1].toLowerCase() : ''
  const filteredPosts = showMentionTypeahead
    ? posts.filter(p => p.slug.toLowerCase().includes(mentionQuery) || p.title.toLowerCase().includes(mentionQuery))
    : []

  // Compute /effect subcommand typeahead
  const effectMatch = input.match(/^\/effect\s+(.*)$/i)
  const showEffectTypeahead = effectMatch !== null
  const effectQuery = effectMatch ? effectMatch[1].toLowerCase() : ''
  const filteredEffects = showEffectTypeahead
    ? EFFECT_REGISTRY.filter(e => e.name.toLowerCase().startsWith(effectQuery))
    : []

  // Compute /theme subcommand typeahead
  const themeMatch = input.match(/^\/theme\s+(.*)$/i)
  const showThemeTypeahead = themeMatch !== null
  const themeQuery = themeMatch ? themeMatch[1].toLowerCase() : ''
  const filteredThemes = showThemeTypeahead
    ? THEME_REGISTRY.filter(t => t.name.toLowerCase().startsWith(themeQuery))
    : []

  // Reset typeahead index when filtered results change
  useEffect(() => {
    setTypeaheadIndex(0)
  }, [typeaheadQuery])

  useEffect(() => {
    setMentionTypeaheadIndex(0)
  }, [mentionQuery])

  useEffect(() => {
    setEffectTypeaheadIndex(0)
  }, [effectQuery])

  useEffect(() => {
    setThemeTypeaheadIndex(0)
  }, [themeQuery])

  // Scroll selected typeahead option into view
  useEffect(() => {
    if (showTypeahead && typeaheadRef.current) {
      const selected = typeaheadRef.current.querySelector(`[data-index="${typeaheadIndex}"]`)
      selected?.scrollIntoView({ block: 'nearest' })
    }
  }, [typeaheadIndex, showTypeahead])

  useEffect(() => {
    if (showMentionTypeahead && mentionTypeaheadRef.current) {
      const selected = mentionTypeaheadRef.current.querySelector(`[data-index="${mentionTypeaheadIndex}"]`)
      selected?.scrollIntoView({ block: 'nearest' })
    }
  }, [mentionTypeaheadIndex, showMentionTypeahead])

  useEffect(() => {
    if (showEffectTypeahead && effectTypeaheadRef.current) {
      const selected = effectTypeaheadRef.current.querySelector(`[data-index="${effectTypeaheadIndex}"]`)
      selected?.scrollIntoView({ block: 'nearest' })
    }
  }, [effectTypeaheadIndex, showEffectTypeahead])

  useEffect(() => {
    if (showThemeTypeahead && themeTypeaheadRef.current) {
      const selected = themeTypeaheadRef.current.querySelector(`[data-index="${themeTypeaheadIndex}"]`)
      selected?.scrollIntoView({ block: 'nearest' })
    }
  }, [themeTypeaheadIndex, showThemeTypeahead])

  // Window state
  const [windowState, setWindowState] = useState<WindowState>(DEFAULT_STATE)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typeaheadRef = useRef<HTMLDivElement>(null)
  const mentionTypeaheadRef = useRef<HTMLDivElement>(null)
  const effectTypeaheadRef = useRef<HTMLDivElement>(null)
  const themeTypeaheadRef = useRef<HTMLDivElement>(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 })

  // Load saved window state
  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setWindowState(parsed)
      } catch (e) {
        // Use default
      }
    } else {
      // Center on first load
      setWindowState({
        ...DEFAULT_STATE,
        x: window.innerWidth - DEFAULT_STATE.width - 24,
        y: window.innerHeight - DEFAULT_STATE.height - 24,
      })
    }
  }, [])

  // Save window state
  useEffect(() => {
    if (windowState.x >= 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(windowState))
    }
  }, [windowState])

  // Drag handling
  const handleDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    setIsDragging(true)
    dragOffset.current = {
      x: e.clientX - windowState.x,
      y: e.clientY - windowState.y,
    }
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      setWindowState(prev => ({
        ...prev,
        x: Math.max(0, Math.min(window.innerWidth - prev.width, e.clientX - dragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - prev.height, e.clientY - dragOffset.current.y)),
      }))
    }

    const handleMouseUp = () => setIsDragging(false)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  // Resize handling
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: windowState.width,
      height: windowState.height,
    }
  }

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.current.x
      const deltaY = e.clientY - resizeStart.current.y
      setWindowState(prev => ({
        ...prev,
        width: Math.max(MIN_SIZE.width, resizeStart.current.width + deltaX),
        height: Math.max(MIN_SIZE.height, resizeStart.current.height + deltaY),
      }))
    }

    const handleMouseUp = () => setIsResizing(false)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  // Keyboard shortcut to toggle agent
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'a' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
        e.preventDefault()
        if (isOpen) {
          handleClose()
        } else {
          setIsOpen(true)
        }
      }
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Listen for external toggle event
  useEffect(() => {
    const handleToggle = () => {
      if (isOpen) {
        handleClose()
      } else {
        setIsOpen(true)
      }
    }
    window.addEventListener('toggle-agent', handleToggle)
    return () => window.removeEventListener('toggle-agent', handleToggle)
  }, [isOpen])

  // Listen for external prefill/submit events
  useEffect(() => {
    const handlePrefill = (e: Event) => {
      const detail = (e as CustomEvent<{ text: string; autoSubmit?: boolean }>).detail
      if (detail.autoSubmit) {
        // Auto-submit: open console and send message
        setIsOpen(true)
        // Small delay to ensure console is open before sending
        setTimeout(() => sendMessage(detail.text), 100)
      } else {
        // Prefill only: open console and set input
        setIsOpen(true)
        setInput(detail.text)
      }
    }
    window.addEventListener('agent-prefill', handlePrefill)
    return () => window.removeEventListener('agent-prefill', handlePrefill)
  }, [])

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Scroll to bottom on new messages, activities, or when opening
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, currentActivities])

  // Scroll to bottom when opening (especially for mobile)
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'instant' })
      }, 50)
    }
  }, [isOpen])

  // Auto-resize textarea based on content
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`
    }
  }, [input])


  // Close with animation
  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
    }, 200)
  }

  // Parse and execute commands from assistant response
  const parseCommands = useCallback((text: string) => {
    const commandRegex = /```json:command\s*\n?({[\s\S]*?})\s*\n?```/g
    let match
    while ((match = commandRegex.exec(text)) !== null) {
      try {
        const cmd = JSON.parse(match[1])
        if (cmd.action && onCommand) {
          onCommand(cmd.action, cmd.value)
        }
      } catch (e) {
        console.error('Failed to parse command:', e)
      }
    }
  }, [onCommand])

  const sendMessage = async (messageOverride?: string) => {
    const userMessage = messageOverride?.trim() || input.trim()
    if (!userMessage || isStreaming) return

    setInputHistory(prev => [...prev, userMessage])
    setHistoryIndex(-1)
    if (!messageOverride) setInput('')
    // Reset textarea height and maintain focus
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.focus()
    }

    // Check for client-side commands first
    if (userMessage.startsWith('/')) {
      const [cmd, ...argParts] = userMessage.slice(1).split(' ')
      const args = argParts.join(' ')
      const cmdLower = cmd.toLowerCase()

      // Handle /view - generate view inline
      if (cmdLower === 'view') {
        if (!args.trim()) {
          setMessages(prev => [...prev, { role: 'user', content: userMessage }])
          setMessages(prev => [...prev, { role: 'assistant', content: 'Usage: /view <description of what you want to see>' }])
          return
        }

        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setIsStreaming(true)
        setCurrentActivities([{ type: 'thinking' }])
        setMessages(prev => [...prev, { role: 'assistant', content: '' }])

        // Fetch view generation inline
        try {
          const history = messages.map(m => ({ role: m.role, content: m.content }))
          const response = await fetch('/api/generate-view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: args, history }),
          })

          if (!response.ok) throw new Error('Failed to generate view')

          const reader = response.body?.getReader()
          if (!reader) throw new Error('No response body')

          const decoder = new TextDecoder()

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6))
                  if (data.type === 'view') {
                    setMessages(prev => {
                      const updated = [...prev]
                      updated[updated.length - 1] = {
                        role: 'assistant',
                        content: '',
                        view: { title: data.title, mdx: data.mdx }
                      }
                      return updated
                    })
                  } else if (data.type === 'error') {
                    // Handle session expiry
                    if (data.errorType === 'session_expired') {
                      setSandboxStatus('idle')
                    }
                    setMessages(prev => {
                      const updated = [...prev]
                      updated[updated.length - 1] = {
                        role: 'assistant',
                        content: data.errorType === 'session_expired'
                          ? 'Session expired. Please try again.'
                          : `Error: ${data.message}`
                      }
                      return updated
                    })
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          setMessages(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = { role: 'assistant', content: 'Failed to generate view.' }
            return updated
          })
        } finally {
          setIsStreaming(false)
          setCurrentActivities([])
          // Re-focus input after view generation
          setTimeout(() => inputRef.current?.focus(), 0)
        }
        return
      }

      const handler = CLIENT_COMMANDS[cmdLower]
      if (handler) {
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        const response = handler(args, { setMessages, onCommand })
        if (response) {
          setMessages(prev => [...prev, { role: 'assistant', content: response }])
        }
        // Re-focus input after client command
        setTimeout(() => inputRef.current?.focus(), 0)
        return
      }
    }

    // Extract @mentions from message
    const mentionRegex = /@([\w-]+)/g
    const mentions: string[] = []
    let match
    while ((match = mentionRegex.exec(userMessage)) !== null) {
      const slug = match[1]
      if (posts.some(p => p.slug === slug)) {
        mentions.push(slug)
      }
    }

    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsStreaming(true)
    setCurrentActivities([{ type: 'thinking' }])
    setMessages(prev => [...prev, { role: 'assistant', content: '', activities: [] }])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          mentions,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error:', response.status, errorText)
        throw new Error(`API error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let assistantMessage = ''
      const activities: Activity[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.type === 'thinking') {
                setCurrentActivities([{ type: 'thinking' }])
              } else if (data.type === 'activity') {
                const kindMap: Record<string, Activity['type']> = {
                  skill: 'skill',
                  tool: 'tool',
                  system: 'system',
                  result: 'result',
                }
                const activity: Activity = {
                  type: kindMap[data.kind] || 'tool',
                  tool: data.tool,
                  detail: data.detail,
                }
                activities.push(activity)
                setCurrentActivities([...activities])
                setMessages(prev => {
                  const updated = [...prev]
                  updated[updated.length - 1] = { role: 'assistant', content: assistantMessage, activities: [...activities] }
                  return updated
                })
              } else if (data.type === 'streaming') {
                setCurrentActivities(activities.filter(a => a.type !== 'thinking'))
              } else if (data.type === 'text') {
                assistantMessage += data.content
                setMessages(prev => {
                  const updated = [...prev]
                  updated[updated.length - 1] = { role: 'assistant', content: assistantMessage, activities }
                  return updated
                })
              } else if (data.type === 'done') {
                setCurrentActivities([])
                parseCommands(assistantMessage)
              } else if (data.type === 'error') {
                console.error('Stream error:', data.message)
                setCurrentActivities([])

                // Handle session expiry - reset sandbox status to trigger re-warmup
                if (data.errorType === 'session_expired') {
                  setSandboxStatus('idle')
                }

                setMessages(prev => {
                  const updated = [...prev]
                  updated[updated.length - 1] = {
                    role: 'assistant',
                    content: data.errorType === 'session_expired'
                      ? 'Session expired. Please try again.'
                      : `Error: ${data.message}`
                  }
                  return updated
                })
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setCurrentActivities([])
      setMessages(prev => {
        const updated = [...prev]
        if (updated.length > 0 && updated[updated.length - 1].role === 'assistant' && updated[updated.length - 1].content === '') {
          updated[updated.length - 1] = { role: 'assistant', content: 'Connection error.' }
        } else {
          updated.push({ role: 'assistant', content: 'Connection error.' })
        }
        return updated
      })
    } finally {
      setIsStreaming(false)
      setCurrentActivities([])
      // Re-focus input after response completes
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  const selectTypeaheadCommand = (cmd: typeof COMMAND_REGISTRY[0]) => {
    setTypeaheadIndex(0)
    setInput(`/${cmd.name} `)
  }

  const selectMention = (post: typeof posts[0]) => {
    setMentionTypeaheadIndex(0)
    // Replace the @partial with @full-slug
    const newInput = input.replace(/@\S*$/, `@${post.slug} `)
    setInput(newInput)
  }

  const selectEffect = (effect: typeof EFFECT_REGISTRY[0], submit = false) => {
    setEffectTypeaheadIndex(0)
    const newInput = `/effect ${effect.name}`
    if (submit) {
      // Clear input and trigger command immediately
      setInput('')
      setTimeout(() => sendMessage(newInput), 0)
    } else {
      setInput(newInput)
    }
  }

  const selectTheme = (theme: typeof THEME_REGISTRY[0], submit = false) => {
    setThemeTypeaheadIndex(0)
    const newInput = `/theme ${theme.name}`
    if (submit) {
      setInput('')
      setTimeout(() => sendMessage(newInput), 0)
    } else {
      setInput(newInput)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Theme subcommand typeahead takes highest priority
    if (showThemeTypeahead && filteredThemes.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setThemeTypeaheadIndex(prev => Math.min(prev + 1, filteredThemes.length - 1))
        return
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setThemeTypeaheadIndex(prev => Math.max(prev - 1, 0))
        return
      } else if (e.key === 'Tab') {
        e.preventDefault()
        selectTheme(filteredThemes[themeTypeaheadIndex])
        return
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        selectTheme(filteredThemes[themeTypeaheadIndex], true)
        return
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setInput('/theme ')
        return
      }
    }

    // Effect subcommand typeahead
    if (showEffectTypeahead && filteredEffects.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setEffectTypeaheadIndex(prev => Math.min(prev + 1, filteredEffects.length - 1))
        return
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setEffectTypeaheadIndex(prev => Math.max(prev - 1, 0))
        return
      } else if (e.key === 'Tab') {
        e.preventDefault()
        selectEffect(filteredEffects[effectTypeaheadIndex])
        return
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        selectEffect(filteredEffects[effectTypeaheadIndex], true)
        return
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setInput('/effect ')
        return
      }
    }

    // Typeahead navigation takes priority when visible
    if (showTypeahead && filteredCommands.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setTypeaheadIndex(prev => Math.min(prev + 1, filteredCommands.length - 1))
        return
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setTypeaheadIndex(prev => Math.max(prev - 1, 0))
        return
      } else if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
        e.preventDefault()
        selectTypeaheadCommand(filteredCommands[typeaheadIndex])
        return
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setInput('')
        return
      }
    }

    // Mention typeahead navigation
    if (showMentionTypeahead && filteredPosts.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setMentionTypeaheadIndex(prev => Math.min(prev + 1, filteredPosts.length - 1))
        return
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setMentionTypeaheadIndex(prev => Math.max(prev - 1, 0))
        return
      } else if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
        e.preventDefault()
        selectMention(filteredPosts[mentionTypeaheadIndex])
        return
      } else if (e.key === 'Escape') {
        e.preventDefault()
        // Remove the @partial
        setInput(input.replace(/@\S*$/, ''))
        return
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    } else if (e.key === 'ArrowUp' && inputHistory.length > 0) {
      e.preventDefault()
      const newIndex = historyIndex === -1 ? inputHistory.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(newIndex)
      setInput(inputHistory[newIndex])
    } else if (e.key === 'ArrowDown' && historyIndex !== -1) {
      e.preventDefault()
      const newIndex = historyIndex + 1
      if (newIndex >= inputHistory.length) {
        setHistoryIndex(-1)
        setInput('')
      } else {
        setHistoryIndex(newIndex)
        setInput(inputHistory[newIndex])
      }
    }
  }

  if (!isOpen) {
    if (hideButton) return null
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 px-3 py-1.5 bg-[var(--color-bg)] text-[var(--color-text)] font-mono text-xs uppercase tracking-wider border border-[var(--color-text)] hover:opacity-80 transition-opacity"
      >
        [A] Agent
      </button>
    )
  }

  const sandboxReady = sandboxStatus === 'ready' || sandboxStatus === 'idle'
  const sandboxBooting = sandboxStatus === 'creating' || sandboxStatus === 'cloning' || sandboxStatus === 'installing'

  // Shared content renderer for both mobile and desktop
  const renderConsoleContent = () => (
    <div
      className="flex-1 flex flex-col bg-[var(--color-bg)] overflow-hidden"
      onClick={(e) => {
        const selection = window.getSelection()
        const hasSelection = selection && selection.toString().length > 0
        const isClickOnInput = (e.target as HTMLElement).tagName === 'TEXTAREA'
        if (!hasSelection && !isClickOnInput && inputRef.current && sandboxReady) {
          inputRef.current.focus()
        }
      }}
    >
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs bg-[var(--console-content-bg)]">
        {messages.length === 0 && (
          <div className="text-[var(--console-muted)]">
            <p className="text-[11px] whitespace-pre-line">{WELCOME_TEXT}</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isLastMessage = i === messages.length - 1
          const showActivities = msg.role === 'assistant' && msg.activities && msg.activities.length > 0
          const showCurrentActivities = isLastMessage && isStreaming && currentActivities.length > 0

          return (
            <div key={i} className={msg.role === 'user' ? 'text-[var(--console-muted)]' : 'text-[var(--console-text)]'}>
              {msg.role === 'user' ? (
                <div className="flex items-start gap-2">
                  <span className="text-[var(--console-accent)]">❯</span>
                  <span>{msg.content}</span>
                </div>
              ) : (
                <>
                  {showCurrentActivities && (
                    <ActivityDisplay activities={currentActivities} isActive={isStreaming} />
                  )}
                  {!showCurrentActivities && showActivities && (
                    <ActivityDisplay activities={msg.activities!} isActive={false} />
                  )}
                  <div className="pl-4 leading-relaxed console-markdown-light">
                    {msg.view ? (
                      <InlineView view={msg.view} />
                    ) : msg.content ? (
                      <Streamdown
                        mode={isLastMessage && isStreaming ? 'streaming' : 'static'}
                        isAnimating={isLastMessage && isStreaming}
                        caret="block"
                        controls={false}
                        components={markdownComponents}
                        className="text-xs"
                      >
                        {msg.content}
                      </Streamdown>
                    ) : (
                      isLastMessage && isStreaming && currentActivities.length === 0 && (
                        <span className="text-[var(--console-muted)]">...</span>
                      )
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[var(--color-border)] p-3 bg-[var(--console-content-bg)]">
        <div className="flex items-start gap-2">
          <span className={`leading-[1.4] ${sandboxBooting ? 'text-[var(--console-muted)] opacity-50' : 'text-[var(--console-accent)]'}`}>❯</span>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={sandboxBooting ? "Initializing agent..." : "Ask anything, try /... or @..."}
            disabled={isStreaming || sandboxBooting}
            className={`flex-1 bg-transparent outline-none resize-none text-xs leading-[1.4] overflow-y-auto ${
              sandboxBooting
                ? 'text-[var(--console-muted)] placeholder-[var(--console-muted)] opacity-50'
                : 'text-[var(--console-text)] placeholder-[var(--console-muted)]'
            }`}
            rows={1}
            style={{ maxHeight: '120px' }}
          />
          {isStreaming && (
            <span className="text-[var(--console-accent)] text-[10px] animate-pulse leading-[1.4]">●</span>
          )}
        </div>
      </div>

      {/* Command Typeahead */}
      {showTypeahead && filteredCommands.length > 0 && (
        <div ref={typeaheadRef} className="border-t border-[var(--color-border)] bg-[var(--console-content-bg)] max-h-[108px] overflow-y-auto">
          {filteredCommands.map((cmd, idx) => (
            <div
              key={cmd.name}
              data-index={idx}
              onClick={() => selectTypeaheadCommand(cmd)}
              className={`px-3 py-2 cursor-pointer flex items-center gap-3 text-xs font-mono ${
                idx === typeaheadIndex
                  ? 'bg-[var(--console-accent)]/10'
                  : 'hover:bg-[var(--console-accent)]/5'
              }`}
            >
              <span className="text-[var(--console-accent)] w-24 shrink-0">/{cmd.name}</span>
              <span className="text-[var(--console-muted)] truncate">{cmd.description}</span>
              <span className="text-[var(--console-muted)] opacity-50 ml-auto text-[10px]">
                {cmd.type === 'client' ? 'instant' : 'agent'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* @Mention Typeahead */}
      {showMentionTypeahead && filteredPosts.length > 0 && (
        <div ref={mentionTypeaheadRef} className="border-t border-[var(--color-border)] bg-[var(--console-content-bg)] max-h-[108px] overflow-y-auto">
          {filteredPosts.map((post, idx) => (
            <div
              key={post.slug}
              data-index={idx}
              onClick={() => selectMention(post)}
              className={`px-3 py-2 cursor-pointer flex items-center gap-3 text-xs font-mono ${
                idx === mentionTypeaheadIndex
                  ? 'bg-[var(--console-accent)]/10'
                  : 'hover:bg-[var(--console-accent)]/5'
              }`}
            >
              <span className="text-[#7aa2f7] shrink-0">@{post.slug}</span>
              <span className="text-[var(--console-muted)] truncate">{post.title}</span>
              <span className="text-[var(--console-muted)] opacity-50 ml-auto text-[10px]">
                {post.date}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Effect Subcommand Typeahead */}
      {showEffectTypeahead && filteredEffects.length > 0 && (
        <div ref={effectTypeaheadRef} className="border-t border-[var(--color-border)] bg-[var(--console-content-bg)] max-h-[108px] overflow-y-auto">
          {filteredEffects.map((effect, idx) => (
            <div
              key={effect.name}
              data-index={idx}
              onClick={() => selectEffect(effect, true)}
              className={`px-3 py-2 cursor-pointer flex items-center gap-3 text-xs font-mono ${
                idx === effectTypeaheadIndex
                  ? 'bg-[var(--console-accent)]/10'
                  : 'hover:bg-[var(--console-accent)]/5'
              }`}
            >
              <span className="text-[var(--console-muted)] opacity-60 w-8 text-center tracking-tighter">{effect.hint}</span>
              <span className="text-[var(--console-accent)] shrink-0">{effect.name}</span>
              <span className="text-[var(--console-muted)] truncate">{effect.description}</span>
              <span className="text-[var(--console-muted)] opacity-40 ml-auto text-[10px]">tab ↹</span>
            </div>
          ))}
        </div>
      )}

      {/* Theme Subcommand Typeahead */}
      {showThemeTypeahead && filteredThemes.length > 0 && (
        <div ref={themeTypeaheadRef} className="border-t border-[var(--color-border)] bg-[var(--console-content-bg)] max-h-[108px] overflow-y-auto">
          {filteredThemes.map((theme, idx) => (
            <div
              key={theme.name}
              data-index={idx}
              onClick={() => selectTheme(theme, true)}
              className={`px-3 py-2 cursor-pointer flex items-center gap-3 text-xs font-mono ${
                idx === themeTypeaheadIndex
                  ? 'bg-[var(--console-accent)]/10'
                  : 'hover:bg-[var(--console-accent)]/5'
              }`}
            >
              <span className="text-[var(--console-muted)] opacity-60 w-8 text-center tracking-tighter">{theme.hint}</span>
              <span className="text-[var(--console-accent)] shrink-0">{theme.name}</span>
              <span className="text-[var(--console-muted)] truncate">{theme.description}</span>
              <span className="text-[var(--console-muted)] opacity-40 ml-auto text-[10px]">tab ↹</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // Mobile: Full-width bottom drawer with safe area support
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-300 ${
            isClosing ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={handleClose}
        />

        {/* Drawer - full width, respects safe areas */}
        <div
          data-console
          className={`fixed inset-x-0 bottom-0 z-50 font-mono text-sm transition-transform duration-300 ease-out ${
            isClosing ? 'translate-y-full' : 'translate-y-0'
          }`}
          style={{
            height: 'calc(70vh - env(safe-area-inset-top, 0px))',
            maxHeight: '500px',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          <div className="h-full flex flex-col bg-[var(--console-outer-bg)] border-t border-x border-[var(--color-text)] p-1">
            {/* Drag handle indicator */}
            <div className="flex justify-center py-1">
              <div className="w-10 h-1 bg-[var(--color-muted)] rounded-full opacity-50" />
            </div>

            {/* Chrome Title Bar */}
            <div className="flex-shrink-0 flex items-center gap-3 px-1 py-1">
              {/* Console Icon */}
              <div className="p-0.5 text-[var(--color-text)]">
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M11 0H1V1H0V11H1V12H11V11H12V1H11V0ZM11 1V11H1V1H11ZM6 7H10V8H6V7ZM3 7H2V8H3V7ZM4 6V7H3V6H4ZM4 5V6H5V5H4ZM3 4H4V5H3V4ZM3 4V3H2V4H3Z" fill="currentColor"/>
                </svg>
              </div>

              {/* Horizontal line */}
              <div className="flex-1 h-px bg-[var(--color-muted)]" />

              {/* Title Label or Progress */}
              {sandboxBooting ? (
                <HeaderProgress />
              ) : (
                <span className="text-[11px] text-[var(--color-text)] tracking-[0.15em] uppercase font-medium whitespace-nowrap">[ Agent ]</span>
              )}

              {/* Horizontal line */}
              <div className="flex-1 h-px bg-[var(--color-muted)]" />

              {/* Close Icon - larger touch target for mobile */}
              <button
                onClick={handleClose}
                className="p-2 -m-1 hover:opacity-60 transition-opacity text-[var(--color-text)]"
              >
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 flex flex-col border border-[var(--color-text)] overflow-hidden">
              {renderConsoleContent()}
            </div>
          </div>
        </div>
      </>
    )
  }

  // Desktop: Draggable window
  return (
    <div
      data-console
      className={`fixed z-50 font-mono text-sm ${
        isClosing ? 'opacity-0 scale-95 transition-[opacity,transform] duration-200' : 'opacity-100 scale-100'
      }`}
      style={{
        left: windowState.x,
        top: windowState.y,
        width: windowState.width,
        height: windowState.height,
        transformOrigin: 'bottom right',
      }}
    >
      {/* Outer Frame - stripe.dev Art style */}
      <div className="h-full flex flex-col bg-[var(--console-outer-bg)] border border-[var(--color-text)] p-1 relative">

        {/* Chrome Title Bar */}
        <div
          onMouseDown={handleDragStart}
          className={`flex items-center gap-3 px-1 py-1 select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {/* Console Icon - pixelated terminal */}
          <div className="p-0.5 text-[var(--color-text)]">
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M11 0H1V1H0V11H1V12H11V11H12V1H11V0ZM11 1V11H1V1H11ZM6 7H10V8H6V7ZM3 7H2V8H3V7ZM4 6V7H3V6H4ZM4 5V6H5V5H4ZM3 4H4V5H3V4ZM3 4V3H2V4H3Z" fill="currentColor"/>
            </svg>
          </div>

          {/* Horizontal line */}
          <div className="flex-1 h-px bg-[var(--color-muted)]" />

          {/* Title Label or Progress */}
          {sandboxBooting ? (
            <HeaderProgress />
          ) : (
            <span className="text-[11px] text-[var(--color-text)] tracking-[0.15em] uppercase font-medium whitespace-nowrap">[ Agent ]</span>
          )}

          {/* Horizontal line */}
          <div className="flex-1 h-px bg-[var(--color-muted)]" />

          {/* Close Icon */}
          <button
            onClick={handleClose}
            className="p-0.5 hover:opacity-60 transition-opacity text-[var(--color-text)]"
          >
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
        </div>

        {/* Inner Content Frame */}
        <div className="flex-1 flex flex-col border border-[var(--color-text)] overflow-hidden">
          {renderConsoleContent()}
        </div>

        {/* Resize handle - bottom right corner */}
        <div
          onMouseDown={handleResizeStart}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        />
      </div>
    </div>
  )
}
