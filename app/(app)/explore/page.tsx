'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  MapPin,
  Phone,
  Navigation,
  Repeat,
  Heart,
  TrendingDown,
  X,
  Check,
  Globe,
  ExternalLink,
} from 'lucide-react'
import { StatusBadge } from '@/components/page-header'
import {
  dealers as fallbackDealers,
  cars as fallbackCars,
  type Dealer,
  type Car,
  type UserProfile,
} from '@/lib/data'
import { getDealers, getCars } from '@/lib/db'
import { useDb } from '@/lib/use-db'
import { useUser } from '@/contexts/user-context'
import { estimateMonthlyInstallment } from '@/lib/finance-estimate'
import { formatRand, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

type Tab = 'dealers' | 'cars'

function mapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export default function ExplorePage() {
  const { profile: user } = useUser()
  const { data: dealers } = useDb(getDealers, fallbackDealers)
  const { data: cars } = useDb(getCars, fallbackCars)
  const [tab, setTab] = useState<Tab>('dealers')
  const [brand, setBrand] = useState('All')
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [savedIds, setSavedIds] = useState<string[]>([])

  const brands = ['All', ...Array.from(new Set(cars.map((c) => c.brand)))]
  const filteredCars = brand === 'All' ? cars : cars.filter((c) => c.brand === brand)

  function toggleCompare(id: string) {
    setCompareIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : ids.length >= 3 ? ids : [...ids, id],
    )
  }

  function toggleSaved(id: string) {
    setSavedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))
  }

  const compareDealers = dealers.filter((d) => compareIds.includes(d.id))

  return (
    <div>
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl">
        <h1 className="text-lg font-bold">Explore</h1>
        <p className="text-xs text-muted-foreground">Real listings from Super Group Dealerships</p>
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
          {(['dealers', 'cars'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                'rounded-md py-2 text-sm font-semibold capitalize transition-colors',
                tab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
              )}
            >
              {t === 'dealers' ? 'Dealerships' : 'Vehicles'}
            </button>
          ))}
        </div>
        {tab === 'cars' && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {brands.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBrand(b)}
                className={cn(
                  'shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                  brand === b
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-primary',
                )}
              >
                {b}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="space-y-3 px-4 py-5 pb-24">
        {tab === 'dealers'
          ? dealers.map((d) => (
              <DealerCard
                key={d.id}
                dealer={d}
                vehicleCount={cars.filter((c) => c.dealerId === d.id).length}
                comparing={compareIds.includes(d.id)}
                onToggleCompare={() => toggleCompare(d.id)}
              />
            ))
          : filteredCars.length > 0
            ? filteredCars.map((c) => (
                <CarCard
                  key={c.id}
                  car={c}
                  dealer={dealers.find((d) => d.id === c.dealerId)}
                  user={user}
                  saved={savedIds.includes(c.id)}
                  onToggleSaved={() => toggleSaved(c.id)}
                />
              ))
            : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No vehicles found for {brand}.
              </p>
            )}
      </div>

      {tab === 'dealers' && compareIds.length > 0 && (
        <CompareBar
          count={compareIds.length}
          onClear={() => setCompareIds([])}
          dealers={compareDealers}
        />
      )}
    </div>
  )
}

function DealerCard({
  dealer,
  vehicleCount,
  comparing,
  onToggleCompare,
}: {
  dealer: Dealer
  vehicleCount: number
  comparing: boolean
  onToggleCompare: () => void
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold leading-tight">{dealer.name}</p>
          <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" /> {dealer.city}, {dealer.province}
          </div>
        </div>
        {vehicleCount > 0 && (
          <span className="shrink-0 text-right text-xs text-muted-foreground">
            {vehicleCount} listed here
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {dealer.brands.map((b) => (
          <StatusBadge key={b} tone="gold">
            {b}
          </StatusBadge>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <a
          href={mapsSearchUrl(`${dealer.name} ${dealer.city} ${dealer.province}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          <Phone className="size-3.5" />
          Call
        </a>
        <a
          href={mapsSearchUrl(`${dealer.name} ${dealer.city} ${dealer.province}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          <Navigation className="size-3.5" />
          Directions
        </a>
        {dealer.website ? (
          <a
            href={dealer.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            <Globe className="size-3.5" />
            Website
          </a>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={onToggleCompare}
          className={cn(
            'flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-colors',
            comparing
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-primary',
          )}
        >
          {comparing ? <Check className="size-3.5" /> : <Repeat className="size-3.5" />}
          {comparing ? 'Added' : 'Compare'}
        </button>
      </div>
    </div>
  )
}

function CompareBar({
  count,
  onClear,
  dealers,
}: {
  count: number
  onClear: () => void
  dealers: Dealer[]
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="fixed inset-x-0 bottom-16 z-40 mx-auto flex max-w-md items-center justify-between gap-3 border-t border-border bg-card px-4 py-3 shadow-lg">
        <span className="text-sm font-medium">{count} dealer{count > 1 ? 's' : ''} selected</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={count < 2}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-40"
          >
            Compare now
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={() => setOpen(false)}>
          <div
            className="max-h-[80vh] w-full overflow-y-auto rounded-t-2xl bg-card p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold">Compare dealers</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close">
                <X className="size-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-3">
              {dealers.map((d) => (
                <div key={d.id} className="rounded-xl border border-border p-3">
                  <p className="font-semibold">{d.name}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <span className="text-muted-foreground">City: <span className="text-foreground">{d.city}</span></span>
                    <span className="text-muted-foreground">Province: <span className="text-foreground">{d.province}</span></span>
                    <span className="col-span-2 text-muted-foreground">Brands: <span className="text-foreground">{d.brands.join(', ')}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function CarCard({
  car,
  dealer,
  user,
  saved,
  onToggleSaved,
}: {
  car: Car
  dealer?: Dealer
  user: UserProfile | null
  saved: boolean
  onToggleSaved: () => void
}) {
  const hasBenchmark = car.marketValue !== car.price
  const saving = car.marketValue - car.price
  const goodDeal = hasBenchmark && saving > 0
  const pct = hasBenchmark ? Math.abs(Math.round((saving / car.marketValue) * 100)) : 0
  const [showAnalysis, setShowAnalysis] = useState(false)
  const estimate = user ? estimateMonthlyInstallment(car.price, user) : null

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative aspect-[16/10] bg-muted">
        <Image
          src={car.image || '/placeholder.svg'}
          alt={car.title}
          fill
          unoptimized
          sizes="(max-width: 448px) 100vw, 448px"
          className="object-cover"
        />
        <button
          type="button"
          onClick={onToggleSaved}
          aria-label={saved ? 'Remove from saved' : 'Save vehicle'}
          className={cn(
            'absolute right-3 top-3 flex size-9 items-center justify-center rounded-full backdrop-blur transition-colors',
            saved ? 'bg-primary text-primary-foreground' : 'bg-background/80 text-foreground hover:text-primary',
          )}
        >
          <Heart className={cn('size-4', saved && 'fill-current')} />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">
              {car.brand}
            </span>
            <p className="font-semibold leading-tight">{car.title}</p>
            <p className="text-xs text-muted-foreground">
              {car.year} · {formatNumber(car.mileage)} km · {car.transmission} · {car.fuel}
            </p>
            {dealer && (
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                At {dealer.name}, {dealer.city}
              </p>
            )}
          </div>
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-xl font-bold tabular-nums text-primary">{formatRand(car.price)}</p>
            {hasBenchmark && (
              <p className="text-[11px] text-muted-foreground">
                Market: {formatRand(car.marketValue)}
              </p>
            )}
          </div>
          {goodDeal && (
            <StatusBadge tone="success">
              <TrendingDown className="size-3" /> Save {formatRand(saving)}
            </StatusBadge>
          )}
        </div>

        {estimate && (
          <div className="mt-2 flex items-center justify-between rounded-lg bg-muted px-3 py-2">
            <span className="text-[11px] text-muted-foreground">
              Est. instalment · {estimate.rate.toFixed(2)}% · {estimate.termMonths}mo, {estimate.depositPct}% deposit
            </span>
            <span className="text-sm font-semibold tabular-nums">
              {formatRand(estimate.installment)}/mo
            </span>
          </div>
        )}

        {hasBenchmark && (
          <>
            <button
              type="button"
              onClick={() => setShowAnalysis((v) => !v)}
              className="mt-3 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground"
            >
              {showAnalysis ? 'Hide analysis' : 'Is this a good deal?'}
            </button>
            {showAnalysis && (
              <div className="mt-3 rounded-lg border border-border bg-background p-3 text-xs leading-relaxed text-muted-foreground">
                {goodDeal ? (
                  <p>
                    <span className="font-semibold text-success">Good deal.</span> This listing is priced{' '}
                    {formatRand(saving)} ({pct}%) below the market average of{' '}
                    {formatRand(car.marketValue)} for a {car.year} {car.brand} at this mileage.
                  </p>
                ) : (
                  <p>
                    <span className="font-semibold text-warning">Above market.</span> This listing is priced{' '}
                    {formatRand(Math.abs(saving))} ({pct}%) above the market average of{' '}
                    {formatRand(car.marketValue)}. Worth negotiating or comparing other listings first.
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {car.listingUrl && (
          <a
            href={car.listingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary/40 bg-primary/5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10"
          >
            View real listing
            <ExternalLink className="size-3.5" />
          </a>
        )}
      </div>
    </div>
  )
}
