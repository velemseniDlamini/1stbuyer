'use client'

import { useEffect, useRef, useState } from 'react'
import { formatRand } from '@/lib/format'

type FormatKind = 'number' | 'zar' | 'zar-compact' | 'decimal1'

function formatValue(n: number, kind: FormatKind): string {
  switch (kind) {
    case 'zar':
      return formatRand(Math.round(n))
    case 'zar-compact': {
      const rounded = Math.round(n)
      if (rounded >= 1000) return 'R' + (rounded / 1000).toFixed(rounded >= 100000 ? 0 : 1) + 'k'
      return formatRand(rounded)
    }
    case 'decimal1':
      return n.toFixed(1)
    default:
      return Math.round(n).toLocaleString('en-ZA')
  }
}

export function AnimatedCounter({
  value,
  duration = 1200,
  format = 'number',
  prefix = '',
  suffix = '',
  className,
}: {
  value: number
  duration?: number
  format?: FormatKind
  prefix?: string
  suffix?: string
  className?: string
}) {
  const [display, setDisplay] = useState(0)
  const frame = useRef<number>(0)
  const startValue = useRef(0)

  useEffect(() => {
    const from = startValue.current
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(from + (value - from) * eased)
      if (progress < 1) {
        frame.current = requestAnimationFrame(tick)
      } else {
        startValue.current = value
      }
    }
    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [value, duration])

  return (
    <span className={className}>
      {prefix}
      {formatValue(display, format)}
      {suffix}
    </span>
  )
}
