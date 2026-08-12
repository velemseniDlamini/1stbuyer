'use client'

import { useState } from 'react'
import {
  MapPin,
  Phone,
  Navigation,
  Repeat,
  Check,
  Globe,
  X,
} from 'lucide-react'
import { StatusBadge } from '@/components/page-header'
import { dealers as fallbackDealers, cars as fallbackCars, type Dealer } from '@/lib/data'
import { getDealers, getCars } from '@/lib/db'
import { useDb } from '@/lib/use-db'
import { cn } from '@/lib/utils'

// NOTE: the "Vehicles" tab and per-vehicle "Choose this car" flow have been
// removed from the UI for now (per request), but the underlying data/logic
// (lib/db.ts: getCars/selectCar/clearSelectedCar, lib/data.ts: Car type) is
// left intact and untouched so this can be re-enabled later without redoing
// the journey-unlock wiring it powers.

function mapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export default function ExplorePage() {
  const { data: dealers } = useDb(getDealers, fallbackDealers)
  const { data: cars } = useDb(getCars, fallbackCars)
  const [compareIds, setCompareIds] = useState<string[]>([])

  function toggleCompare(id: string) {
    setCompareIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : ids.length >= 3 ? ids : [...ids, id],
    )
  }

  const compareDealers = dealers.filter((d) => compareIds.includes(d.id))
  const dealersByProvince = new Map<string, Dealer[]>()
  for (const d of dealers) {
    const list = dealersByProvince.get(d.province) ?? []
    list.push(d)
    dealersByProvince.set(d.province, list)
  }

  return (
    <div>
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl">
        <h1 className="text-lg font-bold">Dealerships</h1>
        <p className="text-xs text-muted-foreground">Real dealers, grouped by province</p>
      </header>

      <div className="space-y-6 px-4 py-5 pb-24">
        {[...dealersByProvince.entries()].map(([province, provinceDealers]) => (
          <section key={province}>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
              {province} <span className="font-normal">({provinceDealers.length})</span>
            </h2>
            <div className="space-y-3">
              {provinceDealers.map((d) => (
                <DealerCard
                  key={d.id}
                  dealer={d}
                  vehicleCount={cars.filter((c) => c.dealerId === d.id).length}
                  comparing={compareIds.includes(d.id)}
                  onToggleCompare={() => toggleCompare(d.id)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {compareIds.length > 0 && (
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
