'use client'

import { useCallback, useRef, useState } from 'react'
import { Lock, TrendingUp, ArrowRight, CheckCircle2, ExternalLink, RefreshCw, ChevronDown } from 'lucide-react'
import { PageHeader, Overline } from '@/components/page-header'
import { CreditGauge } from '@/components/credit-gauge'
import { scoreFactors, creditBands, bandFor, PRIME_RATE } from '@/lib/data'
import { getCreditHistory, recordCreditCheck } from '@/lib/db'
import { useDb } from '@/lib/use-db'
import { useUser } from '@/contexts/user-context'
import Link from 'next/link'

const DEFAULT_BUREAU = { name: 'TransUnion', url: 'https://www.mycreditcheck.co.za' }

const otherBureauLinks = [
  { name: 'ClearScore SA', url: 'https://www.clearscore.com/za' },
  { name: 'Experian', url: 'https://www.experian.co.za' },
  { name: 'XDS', url: 'https://www.xds.co.za' },
]

export default function CreditPage() {
  const { profile: user, refreshProfile } = useUser()
  const fetchHistory = useCallback(
    () => (user ? getCreditHistory(user.id) : Promise.resolve([])),
    [user],
  )
  const { data: creditHistory } = useDb(fetchHistory, [])
  const [showForm, setShowForm] = useState(false)
  const [opened, setOpened] = useState(false)
  const [showOtherBureaus, setShowOtherBureaus] = useState(false)
  const [bureau, setBureau] = useState(DEFAULT_BUREAU.name)
  const [score, setScore] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scoreInputRef = useRef<HTMLInputElement>(null)

  if (!user) return null

  const connected = user.creditBureau !== 'Not connected'
  const band = bandFor(user.creditScore)
  const maxScore = creditHistory.length ? Math.max(...creditHistory.map((h) => h.score)) : 0
  const minScore = creditHistory.length ? Math.min(...creditHistory.map((h) => h.score)) : 0
  const delta =
    creditHistory.length >= 2 ? creditHistory[creditHistory.length - 1].score - creditHistory[0].score : null

  function startCheck(chosenBureau?: string) {
    if (chosenBureau) setBureau(chosenBureau)
    window.open(
      chosenBureau ? otherBureauLinks.find((b) => b.name === chosenBureau)?.url ?? DEFAULT_BUREAU.url : DEFAULT_BUREAU.url,
      '_blank',
      'noopener,noreferrer',
    )
    setOpened(true)
    setShowForm(true)
    setTimeout(() => scoreInputRef.current?.focus(), 100)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    const parsed = Number(score)
    if (!parsed || parsed < 0 || parsed > 999) {
      setError('Enter the score number shown on your bureau report (0–999).')
      return
    }
    setSaving(true)
    setError(null)
    const ok = await recordCreditCheck(user.id, parsed, bureau)
    setSaving(false)
    if (!ok) {
      setError('Could not save your score — try again.')
      return
    }
    await refreshProfile()
    setShowForm(false)
    setOpened(false)
    setScore('')
  }

  return (
    <div>
      <PageHeader
        title="Credit score"
        subtitle={connected ? `${user.creditBureau} · self-reported` : 'Not connected yet'}
      />
      <div className="space-y-6 px-4 py-5">
        {/* Connect / update card */}
        {(!connected || showForm) && (
          <section className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
            <Overline>Check your real credit score</Overline>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              No bureau offers a way for apps to pull your score automatically — but you get one
              free check a year by law. Tap below, check it on {DEFAULT_BUREAU.name}, then come
              straight back and drop the number in here.
            </p>

            {!opened ? (
              <>
                <button
                  type="button"
                  onClick={() => startCheck()}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground"
                >
                  Check on {DEFAULT_BUREAU.name} <ExternalLink className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowOtherBureaus((v) => !v)}
                  className="mt-2 flex w-full items-center justify-center gap-1 text-xs text-muted-foreground hover:text-primary"
                >
                  Used a different bureau? <ChevronDown className={`size-3.5 transition-transform ${showOtherBureaus ? 'rotate-180' : ''}`} />
                </button>
                {showOtherBureaus && (
                  <div className="mt-2 grid grid-cols-1 gap-2">
                    {otherBureauLinks.map((b) => (
                      <button
                        key={b.name}
                        type="button"
                        onClick={() => startCheck(b.name)}
                        className="flex items-center justify-between gap-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:border-primary/50"
                      >
                        {b.name}
                        <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Your score from {bureau}
                  </label>
                  <input
                    ref={scoreInputRef}
                    type="number"
                    min={0}
                    max={999}
                    required
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="e.g. 675"
                    className="w-full rounded-lg border border-primary/50 bg-background px-3 py-3 text-lg font-semibold outline-none focus:border-primary"
                  />
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save my score'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpened(false)
                    setShowForm(connected ? false : true)
                  }}
                  className="w-full text-center text-xs text-muted-foreground hover:text-primary"
                >
                  Start over
                </button>
              </form>
            )}
          </section>
        )}

        {/* Gauge */}
        <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-6">
          <CreditGauge score={user.creditScore} />
          {delta !== null && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-success">
              <TrendingUp className="size-4" />
              {delta >= 0 ? '+' : ''}
              {delta} points since your first check
            </div>
          )}
          {connected && !showForm && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-3 flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/15"
            >
              <RefreshCw className="size-3.5" /> Update my score
            </button>
          )}
          <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">
            <Lock className="size-3.5" />
            Your score is stored privately in your own account
          </div>
        </div>

        {/* Rate recommendation */}
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <Overline>Your finance outlook</Overline>
          <p className="mt-2 text-sm leading-relaxed">
            With an <span className="font-semibold text-primary">{band.label}</span> score, you
            should qualify for around <span className="font-semibold">{band.rate}</span>. At the
            current prime rate of {PRIME_RATE}%, don&apos;t accept anything above Prime +1%.
          </p>
          <Link
            href="/finance"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Model your instalment <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* History */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold">Score trend</h2>
          {creditHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {connected
                ? `No history yet — your score of ${user.creditScore} is your only check so far. Come back and update it each time you check again to start a trend.`
                : 'Check your score above to start tracking it here.'}
            </p>
          ) : (
            <div className="flex h-32 items-end justify-between gap-2">
              {creditHistory.map((h) => {
                const height = 30 + ((h.score - minScore) / (maxScore - minScore || 1)) * 70
                const isLast = h.month === creditHistory[creditHistory.length - 1].month
                return (
                  <div key={h.month} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">
                      {h.score}
                    </span>
                    <div
                      className={`w-full rounded-t-md ${isLast ? 'bg-primary' : 'bg-primary/30'}`}
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-[11px] text-muted-foreground">{h.month}</span>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Factors */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            What&apos;s affecting your score
          </h2>
          <div className="space-y-3">
            {scoreFactors.map((f) => (
              <div key={f.label} className="rounded-xl border border-border bg-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">{f.label}</span>
                  <span className="text-xs text-muted-foreground">{f.weight}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${f.value}%` }}
                    />
                  </div>
                  <span className="w-9 text-right text-sm font-semibold tabular-nums">
                    {f.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bands */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Score bands</h2>
          <div className="overflow-hidden rounded-xl border border-border">
            {creditBands.map((b, i) => (
              <div
                key={b.label}
                className={`flex items-center justify-between px-4 py-3 text-sm ${
                  i > 0 ? 'border-t border-border' : ''
                } ${b.label === band.label ? 'bg-primary/10' : 'bg-card'}`}
              >
                <span className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                  <span className="font-medium">{b.label}</span>
                  <span className="text-muted-foreground">{b.range}</span>
                </span>
                {b.label === band.label && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                    <CheckCircle2 className="size-3.5" /> You
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Improve tips */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold">Improve your score</h2>
          <ul className="space-y-2.5 text-sm">
            {[
              'Keep your credit utilisation below 30% of available limits.',
              'Never miss a payment — set up debit orders for accounts.',
              'Avoid multiple credit applications in a short period.',
              'Dispute any errors on your report with the bureau directly.',
            ].map((tip) => (
              <li key={tip} className="flex gap-2 text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                {tip}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
