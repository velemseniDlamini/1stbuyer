'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PageHeader({
  title,
  subtitle,
  back = true,
  action,
  className,
}: {
  title: string
  subtitle?: string
  back?: boolean
  action?: React.ReactNode
  className?: string
}) {
  const router = useRouter()
  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl',
        className,
      )}
    >
      {back && (
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-muted"
        >
          <ChevronLeft className="size-5" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action}
    </header>
  )
}

export function Overline({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
      {children}
    </span>
  )
}

export function StatusBadge({
  tone = 'gold',
  children,
}: {
  tone?: 'gold' | 'success' | 'warning' | 'danger' | 'muted'
  children: React.ReactNode
}) {
  const tones: Record<string, string> = {
    gold: 'bg-primary/15 text-primary',
    success: 'bg-success/15 text-success',
    warning: 'bg-warning/15 text-warning',
    danger: 'bg-destructive/15 text-destructive',
    muted: 'bg-muted text-muted-foreground',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold',
        tones[tone],
      )}
    >
      {children}
    </span>
  )
}

export { Link }
