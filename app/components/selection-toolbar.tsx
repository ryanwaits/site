'use client'

import { useState, useEffect, useCallback } from 'react'

interface SelectionState {
  text: string
  x: number
  y: number
}

export function SelectionToolbar() {
  const [selection, setSelection] = useState<SelectionState | null>(null)

  const handleSelection = useCallback(() => {
    const sel = window.getSelection()
    if (sel && sel.toString().trim().length > 0) {
      const range = sel.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      setSelection({
        text: sel.toString().trim(),
        x: rect.left + rect.width / 2,
        y: rect.bottom + window.scrollY,
      })
    } else {
      setSelection(null)
    }
  }, [])

  const handleClickOutside = useCallback((e: MouseEvent) => {
    const toolbar = document.getElementById('selection-toolbar')
    if (toolbar && !toolbar.contains(e.target as Node)) {
      // Check if there's still a valid selection
      const sel = window.getSelection()
      if (!sel || sel.toString().trim().length === 0) {
        setSelection(null)
      }
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mouseup', handleSelection)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mouseup', handleSelection)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleSelection, handleClickOutside])

  const handleExplain = () => {
    if (!selection) return
    window.dispatchEvent(
      new CustomEvent('agent-prefill', {
        detail: { text: `Explain this: "${selection.text}"`, autoSubmit: true },
      })
    )
    setSelection(null)
    window.getSelection()?.removeAllRanges()
  }

  const handleCopyToAgent = () => {
    if (!selection) return
    window.dispatchEvent(
      new CustomEvent('agent-prefill', {
        detail: { text: selection.text, autoSubmit: false },
      })
    )
    setSelection(null)
    window.getSelection()?.removeAllRanges()
  }

  if (!selection) return null

  return (
    <div
      id="selection-toolbar"
      className="fixed z-[100] flex items-center gap-1 p-1 bg-[var(--color-bg)] border border-[var(--color-text)] font-mono text-xs"
      style={{
        left: selection.x,
        top: selection.y + 8,
        transform: 'translateX(-50%)',
      }}
    >
      <button
        onClick={handleExplain}
        className="px-2 py-1 hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] transition-colors"
      >
        Explain
      </button>
      <span className="text-[var(--color-muted)]">|</span>
      <button
        onClick={handleCopyToAgent}
        className="px-2 py-1 hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] transition-colors"
      >
        → Agent
      </button>
    </div>
  )
}
