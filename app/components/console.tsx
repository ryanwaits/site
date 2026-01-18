'use client'

import { useState, useEffect, useRef, useCallback, ComponentPropsWithoutRef } from 'react'
import { Streamdown } from 'streamdown'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import { highlight } from 'sugar-high'
import { viewComponents } from './view-components'
import { SandboxBoot } from './sandbox-boot'
import type { Post } from '@/app/n/posts'

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
const WELCOME_TEXT = `Claude Agent SDK v0.2.7
Sonnet 4`

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
  type: 'client' | 'server'
  args?: string
}> = [
  // Client commands (instant)
  { name: 'help', description: 'Show available commands', type: 'client' },
  { name: 'clear', description: 'Clear console history', type: 'client' },
  { name: 'toggle-theme', description: 'Toggle dark/light mode', type: 'client' },
  { name: 'matrix', description: 'Enter the Matrix', type: 'client' },
  { name: 'confetti', description: 'Celebrate!', type: 'client' },
  { name: 'view', description: 'Generate a custom view', type: 'client', args: '<prompt>' },
  // Server commands (sent to Claude)
  { name: 'about', description: 'About Ryan Waits', type: 'server' },
  { name: 'work', description: 'Work history and projects', type: 'server' },
  { name: 'words', description: 'List of writings', type: 'server' },
  { name: 'read', description: 'Read and discuss a blog post', type: 'server', args: '<slug>' },
]

// Client-side commands - bypass API for instant response
// Note: 'view' command is handled specially in sendMessage since it needs router
const CLIENT_COMMANDS: Record<string, (args: string, helpers: {
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  onCommand?: (action: string, value: string) => void
}) => string | null> = {
  help: () => {
    const clientCmds = COMMAND_REGISTRY.filter(c => c.type === 'client')
    const serverCmds = COMMAND_REGISTRY.filter(c => c.type === 'server')
    return `## Commands\n\n**Instant**\n${clientCmds.map(c => `- \`/${c.name}${c.args ? ' ' + c.args : ''}\` - ${c.description}`).join('\n')}\n\n**Agent**\n${serverCmds.map(c => `- \`/${c.name}${c.args ? ' ' + c.args : ''}\` - ${c.description}`).join('\n')}\n\nOr just ask anything.`
  },

  clear: (_, { setMessages }) => {
    setMessages([])
    return null
  },

  'toggle-theme': (_, { onCommand }) => {
    const isDark = document.documentElement.classList.contains('dark')
    const newTheme = isDark ? 'light' : 'dark'
    onCommand?.('theme', newTheme)
    return `Switched to ${newTheme} mode.`
  },

  matrix: (_, { onCommand }) => {
    onCommand?.('matrix', 'on')
    return 'Wake up, Neo...'
  },

  confetti: (_, { onCommand }) => {
    onCommand?.('confetti', 'on')
    return 'Celebrate!'
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

  // Reset typeahead index when filtered results change
  useEffect(() => {
    setTypeaheadIndex(0)
  }, [typeaheadQuery])

  useEffect(() => {
    setMentionTypeaheadIndex(0)
  }, [mentionQuery])

  // Scroll selected typeahead option into view
  useEffect(() => {
    if (showTypeahead && typeaheadRef.current) {
      const selected = typeaheadRef.current.querySelector(`[data-index="${typeaheadIndex}"]`)
      selected?.scrollIntoView({ block: 'nearest' })
    }
  }, [typeaheadIndex, showTypeahead])

  // Window state
  const [windowState, setWindowState] = useState<WindowState>(DEFAULT_STATE)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typeaheadRef = useRef<HTMLDivElement>(null)
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
                    setMessages(prev => {
                      const updated = [...prev]
                      updated[updated.length - 1] = { role: 'assistant', content: `Error: ${data.message}` }
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
                setMessages(prev => {
                  const updated = [...prev]
                  updated[updated.length - 1] = { role: 'assistant', content: `Error: ${data.message}` }
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
        {/* Show boot animation while sandbox initializes */}
        {sandboxBooting && messages.length === 0 && (
          <SandboxBoot stage={sandboxStatus} />
        )}
        {!sandboxBooting && messages.length === 0 && (
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
          <span className="text-[var(--console-accent)] leading-[1.4]">❯</span>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={sandboxBooting ? "Initializing..." : "Ask anything, try /... or @..."}
            disabled={isStreaming || sandboxBooting}
            className="flex-1 bg-transparent text-[var(--console-text)] placeholder-[var(--console-muted)] outline-none resize-none text-xs leading-[1.4] overflow-y-auto"
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
        <div className="border-t border-[var(--color-border)] bg-[var(--console-content-bg)] max-h-[108px] overflow-y-auto">
          {filteredPosts.map((post, idx) => (
            <div
              key={post.slug}
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
    </div>
  )

  // Mobile: Bottom drawer
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${
            isClosing ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={handleClose}
        />

        {/* Drawer */}
        <div
          className={`fixed inset-x-0 bottom-0 z-50 font-mono text-sm transition-transform duration-300 ease-out px-3 pb-3 ${
            isClosing ? 'translate-y-full' : 'translate-y-0'
          }`}
          style={{ height: '50vh', maxHeight: '420px' }}
        >
          <div className="h-full flex flex-col bg-[var(--console-outer-bg)] border border-[var(--color-text)] rounded-lg p-1">
            {/* Chrome Title Bar - same as desktop */}
            <div className="flex-shrink-0 flex items-center gap-3 px-1 py-1">
              {/* Console Icon */}
              <div className="p-0.5 text-[var(--color-text)]">
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M11 0H1V1H0V11H1V12H11V11H12V1H11V0ZM11 1V11H1V1H11ZM6 7H10V8H6V7ZM3 7H2V8H3V7ZM4 6V7H3V6H4ZM4 5V6H5V5H4ZM3 4H4V5H3V4ZM3 4V3H2V4H3Z" fill="currentColor"/>
                </svg>
              </div>

              {/* Horizontal line */}
              <div className="flex-1 h-px bg-[var(--color-muted)]" />

              {/* Title Label */}
              <span className="text-[11px] text-[var(--color-text)] tracking-[0.15em] uppercase font-medium whitespace-nowrap">[ Agent ]</span>

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

          {/* Title Label */}
          <span className="text-[11px] text-[var(--color-text)] tracking-[0.15em] uppercase font-medium whitespace-nowrap">[ Agent ]</span>

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
