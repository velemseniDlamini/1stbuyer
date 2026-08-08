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
} from 'lucide-react'
import { Logo } from '@/components/logo'
import { MiniGauge } from '@/components/credit-gauge'
import { AnimatedCounter } from '@/components/animated-counter'
import { TipCard } from '@/components/tip-card'
import { NotificationBell } from '@/components/notification-bell'
import { Overline } from '@/components/page-header'
import { getJourneyStages } from '@/lib/db'
import { journeyStages as fallbackJourneyStages } from '@/lib/data'
import { useDb } from '@/lib/use-db'
import { useUser } from '@/contexts/user-context'

export default function DashboardPage() {
  const { profile: user } = useUser()
  const { data: journeyStages } = useDb(getJourneyStages, fallbackJourneyStages)
  const currentStage = journeyStages.find((s) => s.status === 'current')

  if (!user) return null

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl">
        <Logo />
        <div className="flex items-center gap-2">
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
            Good day, {user.firstName}
          </h1>
        </div>

        {/* Quick stats */}
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
          <Link
            href="/credit"
            className="flex min-w-[150px] flex-col gap-1 rounded-xl border border-border bg-card p-4"
          >
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Gauge className="size-3.5" /> Credit Score
            </span>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold tabular-nums">{user.creditScore}</span>
              <MiniGauge score={user.creditScore} />
            </div>
          </Link>

          <div className="flex min-w-[150px] flex-col gap-1 rounded-xl border border-border bg-card p-4">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Wallet className="size-3.5" /> Buying Power
            </span>
            <span className="text-2xl font-bold tabular-nums text-primary">
              <AnimatedCounter value={user.buyingPower} format="zar" />
            </span>
            <span className="text-[11px] text-muted-foreground">Est. affordable price</span>
          </div>

          <div className="flex min-w-[150px] flex-col gap-1 rounded-xl border border-border bg-card p-4">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Route className="size-3.5" /> Journey
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
              <Heart className="size-3.5" /> Saved
            </span>
            <span className="text-2xl font-bold tabular-nums">{user.savedListings}</span>
            <span className="text-[11px] text-muted-foreground">listings</span>
          </Link>
        </div>

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

        {/* Recent activity */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Recent activity</h2>
          <div className="space-y-2">
            <Activity icon={FileText} title="Sale agreement uploaded" meta="AI analysis running · 2h ago" />
            <Activity icon={ShieldCheck} title="Guardian answered your CPA question" meta="Yesterday" />
            <Activity icon={Car} title="Toyota Corolla Cross saved" meta="Motus Sandton · 2 days ago" />
          </div>
        </section>
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
