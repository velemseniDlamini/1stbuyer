'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Logo } from '@/components/logo'
import { supabase } from '@/lib/supabase'

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
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (error) {
        setError(error.message)
        return
      }
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
        router.push('/onboarding')
        router.refresh()
      } else {
        setInfo('Check your email to confirm your account, then sign in.')
        setMode('sign-in')
      }
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6">
        <h1 className="text-lg font-bold">{mode === 'sign-in' ? 'Sign in' : 'Create your account'}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === 'sign-in'
            ? 'Welcome back to your car-buying journey.'
            : 'Set up your profile to get personalised buying power, credit tracking and more.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
          {info && <p className="text-xs text-success">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {mode === 'sign-in' ? 'Sign in' : 'Sign up'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === 'sign-in' ? 'sign-up' : 'sign-in'))
            setError(null)
            setInfo(null)
          }}
          className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-primary"
        >
          {mode === 'sign-in' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}
