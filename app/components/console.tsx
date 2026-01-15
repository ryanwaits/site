'use client'

import { useState, useEffect, useRef, useCallback, ComponentPropsWithoutRef } from 'react'
import { Streamdown } from 'streamdown'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import { viewComponents } from './view-components'

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
  type: 'thinking' | 'tool' | 'skill'
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

// Simple welcome text
const WELCOME_TEXT = `Type /help for commands. Press A to toggle.`

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
  pre: ({ children, ...props }: ComponentPropsWithoutRef<'pre'>) => (
    <pre {...props} className="console-pre">
      {children}
    </pre>
  ),
  code: ({ children, ...props }: ComponentPropsWithoutRef<'code'>) => (
    <code {...props} className="console-code">
      {children}
    </code>
  ),
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

  return <span className="text-[var(--color-accent)]">{SPINNER_FRAMES[frame]}</span>
}

function ActivityDisplay({ activities, isActive }: { activities: Activity[]; isActive: boolean }) {
  if (activities.length === 0 && !isActive) return null

  return (
    <div className="pl-4 space-y-1 text-xs mb-2">
      {activities.map((activity, i) => (
        <div key={i} className="flex items-center gap-2 text-[var(--color-muted)]">
          {activity.type === 'thinking' ? (
            <>
              <Spinner />
              <span>Thinking...</span>
            </>
          ) : (
            <>
              <span className="text-[var(--color-accent)]">◇</span>
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
    return <div className="text-[var(--color-muted)] text-xs">Rendering...</div>
  }

  return (
    <div className="my-2">
      <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted)] mb-2 font-mono">
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

// Client-side commands - bypass API for instant response
// Note: 'view' command is handled specially in sendMessage since it needs router
const CLIENT_COMMANDS: Record<string, (args: string, helpers: {
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  onCommand?: (action: string, value: string) => void
}) => string | null> = {
  help: () => `## Commands

- \`/help\` - Show this help
- \`/view <prompt>\` - Generate a custom view
- \`/clear\` - Clear console

Or just ask anything.`,

  clear: (_, { setMessages }) => {
    setMessages([])
    return null
  },

  theme: (args, { onCommand }) => {
    const theme = args.trim().toLowerCase()
    if (theme === 'dark' || theme === 'light') {
      onCommand?.('theme', theme)
      return `Switched to ${theme} mode.`
    }
    return 'Usage: /theme dark | light'
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
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentActivities, setCurrentActivities] = useState<Activity[]>([])
  const [inputHistory, setInputHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Window state
  const [windowState, setWindowState] = useState<WindowState>(DEFAULT_STATE)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
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

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Scroll to bottom on new messages or activities
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, currentActivities])

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

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return

    const userMessage = input.trim()
    setInputHistory(prev => [...prev, userMessage])
    setHistoryIndex(-1)
    setInput('')
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

    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsStreaming(true)
    setCurrentActivities([{ type: 'thinking' }])
    setMessages(prev => [...prev, { role: 'assistant', content: '', activities: [] }])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
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
                const activity: Activity = {
                  type: data.kind === 'skill' ? 'skill' : 'tool',
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
      <div className="h-full flex flex-col bg-[var(--color-bg)] border border-[var(--color-text)] p-1 relative">

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
        <div
          className="flex-1 flex flex-col border border-[var(--color-text)] bg-[var(--color-bg)] overflow-hidden"
          onClick={(e) => {
            // Focus input when clicking inside console, but not if selecting text
            const selection = window.getSelection()
            const hasSelection = selection && selection.toString().length > 0
            const isClickOnInput = (e.target as HTMLElement).tagName === 'TEXTAREA'
            if (!hasSelection && !isClickOnInput && inputRef.current) {
              inputRef.current.focus()
            }
          }}
        >
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.length === 0 && (
              <div className="text-[var(--color-muted)]">
                <p className="text-[11px]">{WELCOME_TEXT}</p>
              </div>
            )}
            {messages.map((msg, i) => {
              const isLastMessage = i === messages.length - 1
              const showActivities = msg.role === 'assistant' && msg.activities && msg.activities.length > 0
              const showCurrentActivities = isLastMessage && isStreaming && currentActivities.length > 0

              return (
                <div key={i} className={msg.role === 'user' ? 'text-[var(--color-muted)]' : 'text-[var(--color-text)]'}>
                  {msg.role === 'user' ? (
                    <div className="flex items-start gap-2">
                      <span className="text-[var(--color-accent)]">❯</span>
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
                            <span className="text-[var(--color-muted)]">...</span>
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
          <div className="border-t border-[var(--color-border)] p-3">
            <div className="flex items-start gap-2">
              <span className="text-[var(--color-accent)] leading-[1.4]">❯</span>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything or try /help..."
                disabled={isStreaming}
                className="flex-1 bg-transparent text-[var(--color-text)] placeholder-[var(--color-muted)] outline-none resize-none text-xs leading-[1.4] overflow-y-auto"
                rows={1}
                style={{ maxHeight: '120px' }}
              />
              {isStreaming && (
                <span className="text-[var(--color-accent)] text-[10px] animate-pulse leading-[1.4]">●</span>
              )}
            </div>
          </div>
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
