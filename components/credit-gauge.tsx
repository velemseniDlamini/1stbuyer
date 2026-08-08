'use client'

import { useEffect, useState } from 'react'
import { bandFor } from '@/lib/data'
import { cn } from '@/lib/utils'

export function CreditGauge({
  score,
  size = 220,
  strokeWidth = 16,
  showLabel = true,
}: {
  score: number
  size?: number
  strokeWidth?: number
  showLabel?: boolean
}) {
  const min = 300
  const max = 850
  const pct = Math.max(0, Math.min(1, (score - min) / (max - min)))
  const band = bandFor(score)

  // Semi-circle arc
  const radius = (size - strokeWidth) / 2
  const circumference = Math.PI * radius
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setProgress(pct), 150)
    return () => clearTimeout(t)
  }, [pct])

  const center = size / 2
  const height = size / 2 + strokeWidth

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={height} viewBox={`0 0 ${size} ${height}`} role="img" aria-label={`Credit score ${score}, ${band.label}`}>
        <path
          d={`M ${strokeWidth / 2} ${center} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${center}`}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d={`M ${strokeWidth / 2} ${center} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${center}`}
          fill="none"
          stroke={band.color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1)' }}
        />
      </svg>
      {showLabel && (
        <div className="-mt-14 flex flex-col items-center">
          <span className="text-5xl font-bold tabular-nums tracking-tight">{score}</span>
          <span
            className="mt-1 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: `${band.color}22`, color: band.color }}
          >
            {band.label}
          </span>
          <span className="mt-1 text-[11px] text-muted-foreground">TransUnion · 300–850</span>
        </div>
      )}
    </div>
  )
}

export function MiniGauge({ score, className }: { score: number; className?: string }) {
  const band = bandFor(score)
  const pct = Math.max(0, Math.min(1, (score - 300) / 550))
  const size = 56
  const stroke = 6
  const r = (size - stroke) / 2
  const c = Math.PI * r
  return (
    <div className={cn('relative', className)} style={{ width: size, height: size / 2 + 6 }}>
      <svg width={size} height={size / 2 + 6} viewBox={`0 0 ${size} ${size / 2 + 6}`}>
        <path
          d={`M ${stroke / 2} ${size / 2} A ${r} ${r} 0 0 1 ${size - stroke / 2} ${size / 2}`}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d={`M ${stroke / 2} ${size / 2} A ${r} ${r} 0 0 1 ${size - stroke / 2} ${size / 2}`}
          fill="none"
          stroke={band.color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
    </div>
  )
}
