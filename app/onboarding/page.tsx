'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Logo } from '@/components/logo'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/contexts/user-context'
import { provinces, type EmploymentStatus, type BuyingGoal } from '@/lib/data'

const goals: { value: BuyingGoal; label: string }[] = [
  { value: 'first-time', label: 'First-time buyer' },
  { value: 'trade-in', label: 'Trading in a vehicle' },
  { value: 'replacing', label: 'Replacing a vehicle (no trade-in)' },
  { value: 'additional', label: 'Adding another vehicle' },
  { value: 'browsing', label: 'Just browsing' },
]

const employmentOptions: EmploymentStatus[] = [
  'Permanently employed',
  'Contract employed',
  'Self-employed',
  'Unemployed',
]

export default function OnboardingPage() {
  const router = useRouter()
  const { session, profile, loading: userLoading, refreshProfile } = useUser()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState(provinces[0])
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>('Permanently employed')
  const [buyingGoal, setBuyingGoal] = useState<BuyingGoal>('first-time')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userLoading && !session) router.push('/login')
    if (!userLoading && profile) router.push('/')
  }, [userLoading, session, profile, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase || !session?.user) return
    setSubmitting(true)
    setError(null)

    const memberSince = new Date().toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })

    const { error } = await supabase.from('profiles').insert({
      user_id: session.user.id,
      first_name: firstName,
      last_name: lastName,
      member_since: memberSince,
      province,
      city,
      employment_status: employmentStatus,
      monthly_income: 0,
      buying_goal: buyingGoal,
      credit_score: 0,
      credit_bureau: 'Not connected',
      buying_power: 0,
      journey_progress: 0,
      saved_listings: 0,
    })

    setSubmitting(false)
    if (error) {
      setError(error.message)
      return
    }
    await refreshProfile()
    router.push('/know-yourself')
  }

  if (userLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col items-center bg-background px-6 py-10">
      <div className="mb-6">
        <Logo />
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6">
        <h1 className="text-lg font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A few basics to get started — you&apos;ll complete your full financial picture in the next
          step (Know Yourself).
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Field label="First name">
              <input
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </Field>
            <Field label="Last name">
              <input
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </Field>
          </div>

          <Field label="City">
            <input
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </Field>

          <Field label="Province">
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              {provinces.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Employment status">
            <select
              value={employmentStatus}
              onChange={(e) => setEmploymentStatus(e.target.value as EmploymentStatus)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              {employmentOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Buying goal">
            <div className="grid grid-cols-1 gap-2">
              {goals.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setBuyingGoal(g.value)}
                  className={`rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    buyingGoal === g.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </Field>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Create account
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}
