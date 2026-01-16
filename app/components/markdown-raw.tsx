'use client'

import { useMemo } from 'react'

interface MarkdownRawProps {
  content: string
  className?: string
}

// Syntax highlight raw markdown text
function highlightMarkdown(text: string): string {
  const lines = text.split('\n')
  const highlighted = lines.map(line => {
    // Escape HTML first
    let escaped = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    // Check if this is a table separator row BEFORE any replacements
    // Separator rows only contain: | - : and whitespace
    const isSeparatorRow = /^[\s|:\-]+$/.test(line) && line.includes('|') && line.includes('-')
    // Debug: console.log('Line:', line, 'isSep:', isSeparatorRow)

    if (isSeparatorRow) {
      // Handle separator row: replace dashes FIRST (before pipes add class names with dashes)
      return escaped
        .replace(/-+/g, m => `<span class="md-table-dash">${m}</span>`)
        .replace(/\|/g, '<span class="md-table-pipe">|</span>')
        .replace(/:/g, '<span class="md-table-colon">:</span>')
    }

    let result = escaped

    // Headers: # ## ### at start of line
    result = result.replace(
      /^(#{1,6})\s/,
      '<span class="md-hash">$1</span> '
    )

    // Horizontal rules: --- or *** or ___ (full line)
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      return `<span class="md-hr">${escaped}</span>`
    }

    // Bold: **text** or __text__
    result = result.replace(
      /(\*\*|__)([^*_]+)(\*\*|__)/g,
      '<span class="md-bold-marker">$1</span><span class="md-bold">$2</span><span class="md-bold-marker">$3</span>'
    )

    // Inline code: `code`
    result = result.replace(
      /`([^`]+)`/g,
      '<span class="md-code-marker">`</span><span class="md-code">$1</span><span class="md-code-marker">`</span>'
    )

    // Table rows (non-separator) - just highlight pipes
    if (line.includes('|')) {
      result = result.replace(/\|/g, '<span class="md-table-pipe">|</span>')
    }

    // List items: - or * or + at start (with optional indent)
    // But NOT if it's in a table row
    if (!line.includes('|')) {
      result = result.replace(
        /^(\s*)([-*+])\s/,
        '$1<span class="md-list-marker">$2</span> '
      )

      // Numbered list: 1. 2. etc
      result = result.replace(
        /^(\s*)(\d+\.)\s/,
        '$1<span class="md-list-marker">$2</span> '
      )
    }

    // Links: [text](url) - make clickable
    result = result.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (_, text, url) => {
        const isExternal = url.startsWith('http')
        const targetAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''
        return `<a href="${url}"${targetAttr} class="md-link"><span class="md-link-bracket">[</span><span class="md-link-text">${text}</span><span class="md-link-bracket">]</span><span class="md-link-paren">(</span><span class="md-link-url">${url}</span><span class="md-link-paren">)</span></a>`
      }
    )

    // Italic at end: *text* (but not ** which is bold)
    result = result.replace(
      /(?<!\*)\*([^*]+)\*(?!\*)/g,
      '<span class="md-italic-marker">*</span><span class="md-italic">$1</span><span class="md-italic-marker">*</span>'
    )

    return result
  })

  return highlighted.join('\n')
}

export function MarkdownRaw({ content, className = '' }: MarkdownRawProps) {
  const highlighted = useMemo(() => highlightMarkdown(content), [content])

  return (
    <div
      className={`font-mono text-sm leading-relaxed whitespace-pre-wrap ${className}`}
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  )
}
