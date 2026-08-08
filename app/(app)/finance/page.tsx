'use client'

import { useMemo, useState } from 'react'
import { TrendingUp, Info } from 'lucide-react'
import { PageHeader, StatusBadge } from '@/components/page-header'
import { AnimatedCounter } from '@/components/animated-counter'
import { PRIME_RATE } from '@/lib/data'
import { useUser } from '@/contexts/user-context'
import { formatRand } from '@/lib/format'
import { cn } from '@/lib/utils'

export default function FinancePage() {
  const { profile: user } = useUser()
  const [price, setPrice] = useState(389900)
  const [depositPct, setDepositPct] = useState(10)
  const [rate, setRate] = useState(PRIME_RATE + 0.5)
  const [term, setTerm] = useState(72)
  const [balloonOn, setBalloonOn] = useState(false)
  const [balloonPct, setBalloonPct] = useState(30)

  const result = useMemo(() => {
    const deposit = (price * depositPct) / 100
    const balloon = balloonOn ? (price * balloonPct) / 100 : 0
    const principal = price - deposit
    const monthlyRate = rate / 100 / 12
    const n = term
    // Financed amount reduced by present value of balloon
    const pvBalloon = balloon / Math.pow(1 + monthlyRate, n)
    const financed = principal - pvBalloon
    const installment =
      monthlyRate === 0
        ? financed / n
        : (financed * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n))
    const totalPaid = installment * n + deposit + balloon
    const totalInterest = totalPaid - price
    const ratio = installment / (user?.monthlyIncome || 1)

    let affordability: { label: string; tone: 'success' | 'warning' | 'danger' }
    if (ratio <= 0.2) affordability = { label: 'Comfortable', tone: 'success' }
    else if (ratio <= 0.3) affordability = { label: 'A stretch', tone: 'warning' }
    else affordability = { label: 'Risky', tone: 'danger' }

    return { deposit, balloon, installment, totalPaid, totalInterest, ratio, affordability }
  }, [price, depositPct, rate, term, balloonOn, balloonPct, user?.monthlyIncome])

  if (!user) return null

  return (
    <div>
      <PageHeader title="Finance calculator" subtitle="Instalment & affordability" />
      <div className="space-y-6 px-4 py-5">
        {/* Result card */}
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-5">
          <p className="text-xs font-medium text-muted-foreground">Estimated monthly instalment</p>
          <p className="mt-1 text-4xl font-bold tabular-nums text-primary">
            <AnimatedCounter value={result.installment} format="zar" duration={500} />
          </p>
          <div className="mt-3 flex items-center gap-2">
            <StatusBadge tone={result.affordability.tone}>
              {result.affordability.label}
            </StatusBadge>
            <span className="text-xs text-muted-foreground">
              {Math.round(result.ratio * 100)}% of your gross income
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border/60 pt-4 text-center">
            <Metric label="Deposit" value={formatRand(result.deposit)} />
            <Metric label="Total interest" value={formatRand(result.totalInterest)} />
            <Metric label="Total cost" value={formatRand(result.totalPaid)} />
          </div>
          {balloonOn && (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              <span>
                Balloon of {formatRand(result.balloon)} owing at the end of the term — you&apos;ll
                need to settle, refinance or trade in.
              </span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-6 rounded-2xl border border-border bg-card p-5">
          <Slider
            label="Vehicle price"
            value={price}
            min={100000}
            max={1000000}
            step={5000}
            onChange={setPrice}
            display={formatRand(price)}
          />
          <Slider
            label="Deposit"
            value={depositPct}
            min={0}
            max={50}
            step={1}
            onChange={setDepositPct}
            display={`${depositPct}% · ${formatRand((price * depositPct) / 100)}`}
          />
          <Slider
            label="Interest rate"
            value={rate}
            min={7}
            max={20}
            step={0.25}
            onChange={setRate}
            display={`${rate.toFixed(2)}% (Prime ${rate >= PRIME_RATE ? '+' : '−'}${Math.abs(rate - PRIME_RATE).toFixed(2)}%)`}
          />

          {/* Term stepper */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Term</span>
              <span className="text-sm font-semibold text-primary">{term} months</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[24, 36, 48, 60, 72].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTerm(t)}
                  className={cn(
                    'rounded-lg border py-2 text-sm font-medium transition-colors',
                    term === t
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/50',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Balloon toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Balloon payment</p>
              <p className="text-xs text-muted-foreground">Lower monthly, lump sum at the end</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={balloonOn}
              onClick={() => setBalloonOn((v) => !v)}
              className={cn(
                'relative h-7 w-12 rounded-full transition-colors',
                balloonOn ? 'bg-primary' : 'bg-muted',
              )}
            >
              <span
                className={cn(
                  'absolute top-1 size-5 rounded-full bg-background transition-transform',
                  balloonOn ? 'translate-x-6' : 'translate-x-1',
                )}
              />
            </button>
          </div>
          {balloonOn && (
            <Slider
              label="Balloon percentage"
              value={balloonPct}
              min={10}
              max={40}
              step={5}
              onChange={setBalloonPct}
              display={`${balloonPct}%`}
            />
          )}
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
          <TrendingUp className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            Keep your instalment under 20% of gross income for comfort. Guardian recommends
            stress-testing every deal against a 2% rate rise before you sign.
          </span>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-bold tabular-nums">{value}</p>
    </div>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  display: string
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-semibold text-primary">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
        aria-label={label}
      />
    </div>
  )
}
