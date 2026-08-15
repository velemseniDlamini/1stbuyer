'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Logo } from '@/components/logo'
import { supabase } from '@/lib/supabase'
import { logLoginEvent } from '@/lib/db'

type Mode = 'sign-in' | 'sign-up'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase) {
      setError('Supabase is not configured — check your .env.local.')
      return
    }
    setLoading(true)
    setError(null)
    setInfo(null)

    if (mode === 'sign-in') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (error) {
        setError(error.message)
        return
      }
      if (data.user) logLoginEvent(data.user.id)
      router.push('/')
      router.refresh()
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      setLoading(false)
      if (error) {
        setError(error.message)
        return
      }
      if (data.session) {
        if (data.user) logLoginEvent(data.user.id)
        router.push('/onboarding')
        router.refresh()
      } else {
        setInfo('Check your email to confirm your account, then sign in.')
        setMode('sign-in')
      }
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 py-12">
      <div className="mb-10">
        <Logo className="h-10" />
      </div>

      <div className="w-full max-w-[380px]">
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === 'sign-in' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {mode === 'sign-in'
              ? 'Sign in to continue your car-buying journey.'
              : 'Set up your profile to get personalised buying power, credit tracking and more.'}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Email">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-3 text-sm outline-none transition-colors focus:border-primary"
                placeholder="you@example.com"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-3 text-sm outline-none transition-colors focus:border-primary"
                placeholder="••••••••"
              />
            </Field>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {info && <p className="text-sm text-success">{info}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-60"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {mode === 'sign-in' ? 'Sign in' : 'Sign up'}
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === 'sign-in' ? 'sign-up' : 'sign-in'))
            setError(null)
            setInfo(null)
          }}
          className="mt-6 w-full text-center text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          {mode === 'sign-in' ? "Don't have an account? " : 'Already have an account? '}
          <span className="font-semibold text-primary">
            {mode === 'sign-in' ? 'Sign up' : 'Sign in'}
          </span>
        </button>
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
