'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Wallet,
  Gauge,
  Route,
  Heart,
  FileText,
  Calculator,
  ShieldCheck,
  Car,
  AlertCircle,
} from 'lucide-react'
import { Logo } from '@/components/logo'
import { MiniGauge } from '@/components/credit-gauge'
import { AnimatedCounter } from '@/components/animated-counter'
import { TipCard } from '@/components/tip-card'
import { NotificationBell } from '@/components/notification-bell'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Overline } from '@/components/page-header'
import { getJourneyStages, getCars, getExpenses } from '@/lib/db'
import { journeyStages as fallbackJourneyStages, cars as fallbackCars, deriveStageStatuses } from '@/lib/data'
import { validateKnowYourself, validateKnowRights } from '@/lib/journey-validation'
import { useDb } from '@/lib/use-db'
import { useUser } from '@/contexts/user-context'
import { useLanguage } from '@/contexts/language-context'
import { formatRand, formatNumber } from '@/lib/format'
import { useCallback } from 'react'

export default function DashboardPage() {
  const { profile: user } = useUser()
  const { t } = useLanguage()
  const { data: rawStages } = useDb(getJourneyStages, fallbackJourneyStages)
  const { data: cars } = useDb(getCars, fallbackCars)
  const fetchExpenses = useCallback(() => (user ? getExpenses(user.id) : Promise.resolve([])), [user])
  const { data: expenses } = useDb(fetchExpenses, [])

  if (!user) return null

  const journeyStages = deriveStageStatuses(rawStages, {
    knowYourselfComplete: validateKnowYourself(user, expenses).complete,
    rightsComplete: validateKnowRights(user).complete,
  })
  const currentStage = journeyStages.find((s) => s.status === 'current')
  const selectedCar = user.selectedCarId ? cars.find((c) => c.id === user.selectedCarId) : undefined

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl">
        <Logo />
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <NotificationBell />
          <Link
            href="/profile"
            className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
          >
            {user.firstName[0]}
          </Link>
        </div>
      </header>

      <div className="space-y-6 px-4 py-5">
        {/* Greeting */}
        <div>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-ZA', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-balance">
            {t('home.greeting')}, {user.firstName}
          </h1>
        </div>

        {/* Connect credit score prompt */}
        {user.creditBureau === 'Not connected' && (
          <Link
            href="/credit"
            className="flex items-center gap-3 rounded-xl border border-warning/40 bg-warning/5 p-4"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-warning/15 text-warning">
              <AlertCircle className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Check your real credit score</p>
              <p className="text-xs text-muted-foreground">Takes under a minute — unlocks your buying power</p>
            </div>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        )}

        {/* Quick stats */}
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
          <Link
            href="/credit"
            className="flex min-w-[150px] flex-col gap-1 rounded-xl border border-border bg-card p-4"
          >
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Gauge className="size-3.5" /> {t('home.creditScore')}
            </span>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold tabular-nums">{user.creditScore}</span>
              <MiniGauge score={user.creditScore} />
            </div>
          </Link>

          <div className="flex min-w-[150px] flex-col gap-1 rounded-xl border border-border bg-card p-4">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Wallet className="size-3.5" /> {t('home.buyingPower')}
            </span>
            <span className="text-2xl font-bold tabular-nums text-primary">
              <AnimatedCounter value={user.buyingPower} format="zar" />
            </span>
            <span className="text-[11px] text-muted-foreground">Est. affordable price</span>
          </div>

          <div className="flex min-w-[150px] flex-col gap-1 rounded-xl border border-border bg-card p-4">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Route className="size-3.5" /> {t('home.journey')}
            </span>
            <span className="text-2xl font-bold tabular-nums">
              <AnimatedCounter value={user.journeyProgress} format="number" suffix="%" />
            </span>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${user.journeyProgress}%` }} />
            </div>
          </div>

          <Link
            href="/explore"
            className="flex min-w-[130px] flex-col gap-1 rounded-xl border border-border bg-card p-4"
          >
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Heart className="size-3.5" /> {t('home.saved')}
            </span>
            <span className="text-2xl font-bold tabular-nums">{user.savedListings}</span>
            <span className="text-[11px] text-muted-foreground">listings</span>
          </Link>
        </div>

        {/* Your selected car */}
        {selectedCar ? (
          <Link
            href="/explore"
            className="flex items-center gap-3 rounded-xl border border-success/40 bg-success/5 p-4"
          >
            <div className="min-w-0 flex-1">
              <Overline>Your car</Overline>
              <p className="mt-1 truncate text-sm font-semibold">{selectedCar.title}</p>
              <p className="text-xs text-muted-foreground">
                {selectedCar.year} · {formatNumber(selectedCar.mileage)} km · {formatRand(selectedCar.price)}
              </p>
            </div>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        ) : (
          <Link
            href="/explore"
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Car className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t('home.chooseCar')}</p>
              <p className="text-xs text-muted-foreground">Pick a vehicle to move your journey forward</p>
            </div>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        )}

        {/* Continue journey */}
        {currentStage && (
          <Link
            href="/journey"
            className="block rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <Overline>Continue your journey</Overline>
              <span className="text-xs text-muted-foreground">
                Stage {currentStage.id} of {journeyStages.length}
              </span>
            </div>
            <h2 className="text-lg font-bold">{currentStage.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{currentStage.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">≈ {currentStage.time}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                Continue <ArrowRight className="size-4" />
              </span>
            </div>
          </Link>
        )}

        {/* Today's tip */}
        <TipCard />

        {/* Quick actions */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Quick actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction href="/finance" icon={Calculator} label="Finance calculator" />
            <QuickAction href="/documents" icon={FileText} label="Document center" />
            <QuickAction href="/insurance" icon={ShieldCheck} label="Compare insurance" />
            <QuickAction href="/explore" icon={Car} label="Find dealerships" />
          </div>
        </section>

        {selectedCar && (
          <section>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Recent activity</h2>
            <div className="space-y-2">
              <Activity icon={Car} title={`${selectedCar.title} chosen`} meta="Your selected vehicle" />
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: typeof Calculator
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
    >
      <span className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <Icon className="size-5" />
      </span>
      <span className="text-sm font-medium leading-tight">{label}</span>
    </Link>
  )
}

function Activity({
  icon: Icon,
  title,
  meta,
}: {
  icon: typeof FileText
  title: string
  meta: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{meta}</p>
      </div>
    </div>
  )
}
