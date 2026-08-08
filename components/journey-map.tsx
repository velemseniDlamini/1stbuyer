'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Lock, ChevronDown, ArrowRight, Clock } from 'lucide-react'
import { type Stage } from '@/lib/data'
import { cn } from '@/lib/utils'

export function JourneyMap({ stages: journeyStages }: { stages: Stage[] }) {
  const [open, setOpen] = useState<number | null>(
    journeyStages.find((s) => s.status === 'current')?.id ?? null,
  )

  return (
    <ol className="relative space-y-4">
      {journeyStages.map((stage, i) => (
        <li key={stage.id} className="relative pl-14">
          {/* Connector line */}
          {i < journeyStages.length - 1 && (
            <span
              className={cn(
                'absolute left-[22px] top-11 h-[calc(100%+1rem)] w-0.5',
                stage.status === 'completed' ? 'bg-primary' : 'bg-border',
              )}
            />
          )}

          {/* Node */}
          <span
            className={cn(
              'absolute left-0 top-0 flex size-11 items-center justify-center rounded-full border-2 text-sm font-bold',
              stage.status === 'completed' && 'border-primary bg-primary text-primary-foreground',
              stage.status === 'current' && 'border-primary bg-primary/10 text-primary animate-pulse',
              stage.status === 'locked' && 'border-border bg-card text-muted-foreground',
            )}
          >
            {stage.status === 'completed' ? (
              <Check className="size-5" />
            ) : stage.status === 'locked' ? (
              <Lock className="size-4" />
            ) : (
              stage.id
            )}
          </span>

          <StageCard
            stage={stage}
            open={open === stage.id}
            onToggle={() => setOpen(open === stage.id ? null : stage.id)}
          />
        </li>
      ))}
    </ol>
  )
}

function StageCard({
  stage,
  open,
  onToggle,
}: {
  stage: Stage
  open: boolean
  onToggle: () => void
}) {
  const locked = stage.status === 'locked'
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border bg-card transition-colors',
        stage.status === 'current' ? 'border-primary/40' : 'border-border',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
            {stage.tagline}
          </span>
          <p className="font-bold">{stage.title}</p>
        </div>
        <ChevronDown
          className={cn(
            'size-5 shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <p className="text-sm text-muted-foreground">{stage.description}</p>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5" /> ≈ {stage.time}
          </div>

          <ul className="mt-3 space-y-2">
            {stage.actions.map((action) => (
              <li key={action.label} className="flex items-center gap-2 text-sm">
                <span
                  className={cn(
                    'flex size-5 shrink-0 items-center justify-center rounded-full border',
                    action.done
                      ? 'border-success bg-success/15 text-success'
                      : 'border-border text-transparent',
                  )}
                >
                  <Check className="size-3" />
                </span>
                <span className={cn(action.done && 'text-muted-foreground line-through')}>
                  {action.label}
                </span>
              </li>
            ))}
          </ul>

          {!locked && stage.href && (
            <Link
              href={stage.href}
              className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              {stage.status === 'completed' ? 'Review stage' : 'Continue stage'}
              <ArrowRight className="size-4" />
            </Link>
          )}
          {locked && (
            <div className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-muted px-4 py-2.5 text-sm font-medium text-muted-foreground">
              <Lock className="size-4" /> Complete previous stages to unlock
            </div>
          )}
        </div>
      )}
    </div>
  )
}
