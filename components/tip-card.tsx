'use client'

import { useState } from 'react'
import { Lightbulb, RefreshCw } from 'lucide-react'
import { tips as fallbackTips } from '@/lib/data'
import { getTips } from '@/lib/db'
import { useDb } from '@/lib/use-db'
import { Overline } from '@/components/page-header'

export function TipCard() {
  const [index, setIndex] = useState(0)
  const { data: tips } = useDb(getTips, fallbackTips)
  const tip = tips[index % tips.length]

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Lightbulb className="size-4 text-primary" />
          <Overline>Today&apos;s Tip · {tip.tag}</Overline>
        </span>
        <button
          type="button"
          onClick={() => setIndex((i) => i + 1)}
          aria-label="Next tip"
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
        >
          <RefreshCw className="size-3.5" />
        </button>
      </div>
      <p className="text-sm leading-relaxed text-foreground/90">{tip.text}</p>
    </div>
  )
}
