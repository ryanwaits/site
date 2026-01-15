'use client'

import NextLink from 'next/link'
import { ReactNode } from 'react'

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
      {title && <h2 className="text-lg font-medium mb-4 text-[#0b0d0b]">{title}</h2>}
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
  const variantClass = {
    default: 'bg-white/50 border border-[#ccc]',
    outlined: 'border-2 border-[#333]',
    filled: 'bg-[#e8e8e8]',
  }[variant]

  return (
    <div className={`p-4 rounded ${variantClass}`}>
      <div className="prose prose-sm max-w-none">{children}</div>
    </div>
  )
}

interface TagProps {
  color?: 'default' | 'green' | 'blue' | 'yellow'
  children: ReactNode
}

export function Tag({ color = 'default', children }: TagProps) {
  const colorClass = {
    default: 'bg-[#e8e8e8] text-[#333]',
    green: 'bg-[#d4edda] text-[#155724]',
    blue: 'bg-[#cce5ff] text-[#004085]',
    yellow: 'bg-[#fff3cd] text-[#856404]',
  }[color]

  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-mono rounded ${colorClass}`}>
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
        <div className="flex-1 h-px bg-[#ccc]" />
        <span className="text-xs text-[#666] font-mono uppercase tracking-wider">{label}</span>
        <div className="flex-1 h-px bg-[#ccc]" />
      </div>
    )
  }
  return <hr className="my-6 border-t border-[#ccc]" />
}

// ─────────────────────────────────────────
// DATA DISPLAY COMPONENTS
// ─────────────────────────────────────────

interface TimelineProps {
  children: ReactNode
}

export function Timeline({ children }: TimelineProps) {
  return <div className="space-y-4 border-l-2 border-[#ccc] pl-4 ml-2">{children}</div>
}

interface TimelineItemProps {
  date: string
  title: string
  children?: ReactNode
}

export function TimelineItem({ date, title, children }: TimelineItemProps) {
  return (
    <div className="relative">
      <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-[#5a9848]" />
      <div className="text-xs font-mono text-[#666] mb-1">{date}</div>
      <div className="font-medium text-[#0b0d0b]">{title}</div>
      {children && <div className="text-sm text-[#333] mt-1">{children}</div>}
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
    <div className="p-4 border border-[#333] bg-white/30">
      <h3 className="font-medium text-[#0b0d0b]">{title}</h3>
      {subtitle && <div className="text-xs font-mono text-[#666] mb-2">{subtitle}</div>}
      <div className="text-sm text-[#333] mt-2 prose prose-sm max-w-none">{children}</div>
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
      <div className="text-2xl font-bold text-[#0b0d0b]">{value}</div>
      <div className="text-xs font-mono text-[#666] uppercase tracking-wider mt-1">{label}</div>
    </div>
  )
}

interface StatsProps {
  children: ReactNode
}

export function Stats({ children }: StatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-[#ccc]">
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
        className="text-[#5a9848] underline underline-offset-2 hover:text-[#3d6b30]"
      >
        {children}
      </a>
    )
  }

  return (
    <NextLink
      href={href}
      className="text-[#5a9848] underline underline-offset-2 hover:text-[#3d6b30]"
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
      className="block p-4 border border-[#ccc] hover:border-[#333] hover:bg-white/30 transition-colors group"
      {...extraProps}
    >
      <div className="font-medium text-[#0b0d0b] group-hover:text-[#5a9848]">{title}</div>
      {description && (
        <div className="text-sm text-[#666] mt-1">{description}</div>
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
