'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Logo } from '@/components/logo'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/contexts/user-context'
import { provinces, type EmploymentStatus, type BuyingGoal } from '@/lib/data'
import { citiesByProvince } from '@/lib/sa-cities'

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
  const [province, setProvince] = useState(provinces[0])
  const [city, setCity] = useState(citiesByProvince[provinces[0]][0])
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>('Permanently employed')
  const [buyingGoal, setBuyingGoal] = useState<BuyingGoal>('first-time')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userLoading && !session) router.push('/login')
    if (!userLoading && profile) router.push('/')
  }, [userLoading, session, profile, router])

  function handleProvinceChange(next: string) {
    setProvince(next)
    setCity(citiesByProvince[next]?.[0] ?? '')
  }

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
    <div className="flex min-h-dvh flex-col items-center bg-background px-6 py-12">
      <div className="mb-8">
        <Logo className="h-10" />
      </div>

      <div className="w-full max-w-[380px]">
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            A few basics to get started — you&apos;ll complete your full financial picture in the
            next step, Know Yourself.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name">
                <input
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-3 text-sm outline-none transition-colors focus:border-primary"
                />
              </Field>
              <Field label="Last name">
                <input
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-3 text-sm outline-none transition-colors focus:border-primary"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Province">
                <select
                  value={province}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-3 text-sm outline-none transition-colors focus:border-primary"
                >
                  {provinces.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="City">
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-3 text-sm outline-none transition-colors focus:border-primary"
                >
                  {(citiesByProvince[province] ?? []).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Employment status">
              <select
                value={employmentStatus}
                onChange={(e) => setEmploymentStatus(e.target.value as EmploymentStatus)}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-3 text-sm outline-none transition-colors focus:border-primary"
              >
                {employmentOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="What are you looking to do?">
              <select
                value={buyingGoal}
                onChange={(e) => setBuyingGoal(e.target.value as BuyingGoal)}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-3 text-sm outline-none transition-colors focus:border-primary"
              >
                {goals.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </Field>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-60"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Create account
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}
