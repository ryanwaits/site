'use client'

import NextLink from 'next/link'
import { ReactNode } from 'react'

// Console dark theme colors
const colors = {
  text: '#E8E4D9',
  textMuted: '#8A8680',
  accent: '#F6833B',
  accentTeal: '#1588B2',
  border: '#333',
  borderLight: '#444',
  bg: 'rgba(0, 0, 0, 0.3)',
  bgCard: 'rgba(255, 255, 255, 0.05)',
}

// ─────────────────────────────────────────
// LAYOUT COMPONENTS
// ─────────────────────────────────────────

interface GridProps {
  cols?: 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function Grid({ cols = 2, gap = 'md', children }: GridProps) {
  const colsClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[cols]

  const gapClass = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  }[gap]

  return <div className={`grid ${colsClass} ${gapClass}`}>{children}</div>
}

interface StackProps {
  direction?: 'vertical' | 'horizontal'
  gap?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function Stack({ direction = 'vertical', gap = 'md', children }: StackProps) {
  const dirClass = direction === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col'
  const gapClass = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-4',
  }[gap]

  return <div className={`flex ${dirClass} ${gapClass}`}>{children}</div>
}

interface SectionProps {
  title?: string
  children: ReactNode
}

export function Section({ title, children }: SectionProps) {
  return (
    <section className="my-6">
      {title && <h2 className="text-lg font-medium mb-4" style={{ color: colors.text }}>{title}</h2>}
      {children}
    </section>
  )
}

// ─────────────────────────────────────────
// CONTENT COMPONENTS
// ─────────────────────────────────────────

interface CardProps {
  variant?: 'default' | 'outlined' | 'filled'
  children: ReactNode
}

export function Card({ variant = 'default', children }: CardProps) {
  const variantStyle = {
    default: { background: colors.bgCard, border: `1px solid ${colors.border}` },
    outlined: { border: `2px solid ${colors.borderLight}` },
    filled: { background: colors.bg },
  }[variant]

  return (
    <div className="p-4 rounded" style={variantStyle}>
      <div className="prose prose-sm max-w-none" style={{ color: colors.text }}>{children}</div>
    </div>
  )
}

interface TagProps {
  color?: 'default' | 'green' | 'blue' | 'yellow'
  children: ReactNode
}

export function Tag({ color = 'default', children }: TagProps) {
  const colorStyle = {
    default: { background: colors.border, color: colors.text },
    green: { background: '#1a3a1a', color: '#9ece6a' },
    blue: { background: '#1a2a3a', color: '#7aa2f7' },
    yellow: { background: '#3a3a1a', color: '#e0af68' },
  }[color]

  return (
    <span className="inline-block px-2 py-0.5 text-xs font-mono rounded" style={colorStyle}>
      {children}
    </span>
  )
}

interface DividerProps {
  label?: string
}

export function Divider({ label }: DividerProps) {
  if (label) {
    return (
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px" style={{ background: colors.border }} />
        <span className="text-xs font-mono uppercase tracking-wider" style={{ color: colors.textMuted }}>{label}</span>
        <div className="flex-1 h-px" style={{ background: colors.border }} />
      </div>
    )
  }
  return <hr className="my-6 border-t" style={{ borderColor: colors.border }} />
}

// ─────────────────────────────────────────
// DATA DISPLAY COMPONENTS
// ─────────────────────────────────────────

interface TimelineProps {
  children: ReactNode
}

export function Timeline({ children }: TimelineProps) {
  return <div className="space-y-4 pl-4 ml-2" style={{ borderLeft: `2px solid ${colors.border}` }}>{children}</div>
}

interface TimelineItemProps {
  date: string
  title: string
  children?: ReactNode
}

export function TimelineItem({ date, title, children }: TimelineItemProps) {
  return (
    <div className="relative">
      <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full" style={{ background: colors.accent }} />
      <div className="text-xs font-mono mb-1" style={{ color: colors.textMuted }}>{date}</div>
      <div className="font-medium" style={{ color: colors.text }}>{title}</div>
      {children && <div className="text-sm mt-1" style={{ color: colors.textMuted }}>{children}</div>}
    </div>
  )
}

interface ComparisonProps {
  children: ReactNode
}

export function Comparison({ children }: ComparisonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  )
}

interface ComparisonItemProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export function ComparisonItem({ title, subtitle, children }: ComparisonItemProps) {
  return (
    <div className="p-4" style={{ border: `1px solid ${colors.border}`, background: colors.bgCard }}>
      <h3 className="font-medium" style={{ color: colors.text }}>{title}</h3>
      {subtitle && <div className="text-xs font-mono mb-2" style={{ color: colors.textMuted }}>{subtitle}</div>}
      <div className="text-sm mt-2 prose prose-sm max-w-none" style={{ color: colors.textMuted }}>{children}</div>
    </div>
  )
}

interface StatProps {
  label: string
  value: string
}

export function Stat({ label, value }: StatProps) {
  return (
    <div className="text-center p-4">
      <div className="text-2xl font-bold" style={{ color: colors.text }}>{value}</div>
      <div className="text-xs font-mono uppercase tracking-wider mt-1" style={{ color: colors.textMuted }}>{label}</div>
    </div>
  )
}

interface StatsProps {
  children: ReactNode
}

export function Stats({ children }: StatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4" style={{ borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────
// CAROUSEL COMPONENTS
// ─────────────────────────────────────────

interface CarouselProps {
  children: ReactNode
}

export function Carousel({ children }: CarouselProps) {
  return (
    <div className="relative">
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-hide">
        {children}
      </div>
    </div>
  )
}

interface CarouselItemProps {
  children: ReactNode
}

export function CarouselItem({ children }: CarouselItemProps) {
  return (
    <div className="snap-center shrink-0 w-[280px] sm:w-[320px]">
      {children}
    </div>
  )
}

// ─────────────────────────────────────────
// INTERACTIVE COMPONENTS
// ─────────────────────────────────────────

interface LinkProps {
  href: string
  children: ReactNode
}

export function Link({ href, children }: LinkProps) {
  const isExternal = href.startsWith('http')

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:opacity-80"
        style={{ color: colors.accentTeal }}
      >
        {children}
      </a>
    )
  }

  return (
    <NextLink
      href={href}
      className="underline underline-offset-2 hover:opacity-80"
      style={{ color: colors.accentTeal }}
    >
      {children}
    </NextLink>
  )
}

interface LinkCardProps {
  href: string
  title: string
  description?: string
}

export function LinkCard({ href, title, description }: LinkCardProps) {
  const isExternal = href.startsWith('http')
  const Component = isExternal ? 'a' : NextLink
  const extraProps = isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {}

  return (
    <Component
      href={href}
      className="block p-4 transition-colors hover:opacity-80"
      style={{ border: `1px solid ${colors.border}`, background: colors.bgCard }}
      {...extraProps}
    >
      <div className="font-medium" style={{ color: colors.text }}>{title}</div>
      {description && (
        <div className="text-sm mt-1" style={{ color: colors.textMuted }}>{description}</div>
      )}
    </Component>
  )
}

// Export all components as a single object for MDX
export const viewComponents = {
  Grid,
  Stack,
  Section,
  Card,
  Tag,
  Divider,
  Timeline,
  TimelineItem,
  Comparison,
  ComparisonItem,
  Stat,
  Stats,
  Link,
  LinkCard,
  Carousel,
  CarouselItem,
}
