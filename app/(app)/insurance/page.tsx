'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Star, Shield, Check, Info, Car } from 'lucide-react'
import { PageHeader, StatusBadge } from '@/components/page-header'
import { LockedFeature } from '@/components/locked-feature'
import { insuranceProviders as fallbackInsuranceProviders, cars as fallbackCars } from '@/lib/data'
import { getInsuranceProviders, getCars } from '@/lib/db'
import { useDb } from '@/lib/use-db'
import { useJourneyGate } from '@/lib/use-journey-gate'
import { useUser } from '@/contexts/user-context'
import { formatRand, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

const coverageTypes = ['Comprehensive', 'Third-Party F&T', 'Third-Party'] as const

const providerUrls: Record<string, string> = {
  'Discovery Insure': 'https://www.discovery.co.za/insure',
  OUTsurance: 'https://www.outsurance.co.za',
  'King Price': 'https://www.kingprice.co.za',
  MiWay: 'https://www.miway.co.za',
  Santam: 'https://www.santam.co.za',
  'Momentum Insure': 'https://www.momentum.co.za',
}

export default function InsurancePage() {
  const { profile: user } = useUser()
  const { data: insuranceProviders } = useDb(getInsuranceProviders, fallbackInsuranceProviders)
  const { data: cars } = useDb(getCars, fallbackCars)
  const selectedCar = user?.selectedCarId ? cars.find((c) => c.id === user.selectedCarId) : undefined
  const [coverage, setCoverage] = useState<(typeof coverageTypes)[number]>('Comprehensive')
  const [hasTracker, setHasTracker] = useState(true)
  const [garaged, setGaraged] = useState(true)

  const multiplier =
    coverage === 'Comprehensive' ? 1 : coverage === 'Third-Party F&T' ? 0.62 : 0.4
  const discount = (hasTracker ? 0.12 : 0) + (garaged ? 0.08 : 0)

  const providers = useMemo(() => {
    return insuranceProviders
      .map((p) => ({ ...p, quote: Math.round(p.monthly * multiplier * (1 - discount)) }))
      .sort((a, b) => a.quote - b.quote)
  }, [insuranceProviders, multiplier, discount])

  const cheapest = providers[0]?.quote ?? 0
  const dearest = providers[providers.length - 1]?.quote ?? 1
  const annualSaving = (dearest - cheapest) * 12

  const gate = useJourneyGate()
  if (gate.loading) return null
  if (!gate.unlocked) {
    return (
      <div>
        <PageHeader title="Insurance" subtitle="Compare SA providers" />
        <LockedFeature title="Insurance comparison" missing={gate.missing} />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Insurance" subtitle="Compare SA providers" />
      <div className="space-y-6 px-4 py-5">
        {/* Savings banner */}
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-5">
          <p className="text-xs text-muted-foreground">Potential annual saving</p>
          <p className="text-3xl font-bold tabular-nums text-primary">{formatRand(annualSaving)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            by choosing the best-value option below for your profile
          </p>
        </div>

        {/* Vehicle context */}
        {selectedCar ? (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Car className="size-5" />
            </span>
            <div className="text-sm">
              <p className="font-medium">{selectedCar.title}</p>
              <p className="text-xs text-muted-foreground">
                {selectedCar.year} · {formatNumber(selectedCar.mileage)} km · {formatRand(selectedCar.price)}
              </p>
            </div>
          </div>
        ) : (
          <Link
            href="/explore"
            className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-card p-4"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Car className="size-5" />
            </span>
            <div className="text-sm">
              <p className="font-medium">No vehicle chosen yet</p>
              <p className="text-xs text-muted-foreground">Choose a car in Explore to quote insurance for it</p>
            </div>
          </Link>
        )}

        {/* Coverage selector */}
        <div>
          <p className="mb-2 text-sm font-medium">Coverage type</p>
          <div className="grid grid-cols-3 gap-2">
            {coverageTypes.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCoverage(c)}
                className={cn(
                  'rounded-lg border px-2 py-2.5 text-xs font-medium leading-tight transition-colors',
                  coverage === c
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/50',
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-2 gap-3">
          <ToggleChip label="Tracker fitted" active={hasTracker} onClick={() => setHasTracker((v) => !v)} />
          <ToggleChip label="Parked in garage" active={garaged} onClick={() => setGaraged((v) => !v)} />
        </div>

        {/* Provider cards */}
        <section className="space-y-3">
          {providers.map((p, i) => (
            <div
              key={p.id}
              className={cn(
                'rounded-xl border bg-card p-4',
                i === 0 ? 'border-primary/50' : 'border-border',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-lg bg-muted text-sm font-bold text-primary">
                    {p.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                  </span>
                  <div>
                    <p className="font-semibold leading-tight">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.tagline}</p>
                    <span className="mt-1 flex items-center gap-1 text-xs text-warning">
                      <Star className="size-3 fill-warning" /> {p.rating}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold tabular-nums text-primary">
                    {formatRand(p.quote)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">per month</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {i === 0 && <StatusBadge tone="success">Best Value</StatusBadge>}
                <StatusBadge tone="gold">{p.bestFor}</StatusBadge>
              </div>

              <ul className="mt-3 grid gap-1.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="size-3.5 shrink-0 text-success" /> {f}
                  </li>
                ))}
              </ul>

              <a
                href={providerUrls[p.name] ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center rounded-lg border border-primary bg-primary/10 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                Request quote
              </a>
            </div>
          ))}
        </section>

        <div className="flex items-start gap-2 rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            The Road Accident Fund only covers personal injury, never damage to your car. If your
            vehicle is financed, comprehensive cover is compulsory before you drive away.
          </span>
        </div>
      </div>
    </div>
  )
}

function ToggleChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors',
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-card text-muted-foreground',
      )}
    >
      <Shield className={cn('size-3.5', active && 'fill-primary/20')} />
      {label}
    </button>
  )
}
