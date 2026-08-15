'use client'

import { useEffect, useState } from 'react'
import { Loader2, ShieldAlert, Users, LogIn, Clock, Activity } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/contexts/user-context'

type MonthlyPoint = { month: string; count: number }
type Stats = {
  totalUsers: number
  signupsByMonth: MonthlyPoint[]
  loginsByMonth: MonthlyPoint[]
  activeUsersByMonth: MonthlyPoint[]
  buyingGoalBreakdown: { goal: string; count: number }[]
  avgSessionMinutes: number
  totalSessions: number
  totalLogins: number
}

const CATEGORICAL = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181']

export default function AdminInsightsPage() {
  const { session, loading: userLoading } = useUser()
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userLoading) return
    if (!supabase || !session) {
      setError('Not authorized')
      setLoading(false)
      return
    }
    ;(async () => {
      const token = session.access_token
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        setError('Not authorized')
        setLoading(false)
        return
      }
      setStats(await res.json())
      setLoading(false)
    })()
  }, [session, userLoading])

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <ShieldAlert className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Not authorized.</p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-xl font-bold">Admin insights</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Internal usage stats — not linked from anywhere in the app.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile icon={Users} label="Total users" value={stats.totalUsers} />
          <StatTile icon={LogIn} label="Total logins" value={stats.totalLogins} />
          <StatTile icon={Activity} label="Sessions tracked" value={stats.totalSessions} />
          <StatTile
            icon={Clock}
            label="Avg session length"
            value={`${stats.avgSessionMinutes} min`}
          />
        </div>

        <MonthlyBarChart title="Signups by month" data={stats.signupsByMonth} color="var(--primary)" />
        <MonthlyBarChart title="Logins by month" data={stats.loginsByMonth} color="#3987e5" />
        <MonthlyBarChart
          title="Active users by month"
          data={stats.activeUsersByMonth}
          color="#199e70"
        />
        <CategoricalBreakdown data={stats.buyingGoalBreakdown} />
      </div>
    </div>
  )
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <Icon className="size-4 text-muted-foreground" />
      <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function MonthlyBarChart({
  title,
  data,
  color,
}: {
  title: string
  data: MonthlyPoint[]
  color: string
}) {
  const max = Math.max(1, ...data.map((d) => d.count))
  const barWidth = 32
  const gap = 20
  const chartHeight = 120
  const width = data.length * (barWidth + gap)

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      <svg viewBox={`0 0 ${width} ${chartHeight + 40}`} className="w-full" style={{ height: chartHeight + 40 }}>
        <line
          x1={0}
          y1={chartHeight}
          x2={width}
          y2={chartHeight}
          stroke="var(--border)"
          strokeWidth={1}
        />
        {data.map((d, i) => {
          const barHeight = d.count === 0 ? 0 : Math.max((d.count / max) * (chartHeight - 24), 3)
          const x = i * (barWidth + gap) + gap / 2
          const y = chartHeight - barHeight
          return (
            <g key={d.month}>
              <rect x={x} y={y} width={barWidth} height={barHeight} rx={4} fill={color}>
                <title>{`${d.month}: ${d.count}`}</title>
              </rect>
              <text
                x={x + barWidth / 2}
                y={y - 8}
                textAnchor="middle"
                fontSize={11}
                fill="var(--muted-foreground)"
              >
                {d.count}
              </text>
              <text
                x={x + barWidth / 2}
                y={chartHeight + 20}
                textAnchor="middle"
                fontSize={10}
                fill="var(--muted-foreground)"
              >
                {d.month.split(' ')[0]}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function CategoricalBreakdown({ data }: { data: { goal: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count))
  const total = data.reduce((a, b) => a + b.count, 0)

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Buying goal breakdown</h2>
        <p className="mt-2 text-xs text-muted-foreground">No users yet.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-4 text-sm font-semibold">Buying goal breakdown</h2>
      <div className="space-y-3">
        {data.map((d, i) => {
          const color = CATEGORICAL[i % CATEGORICAL.length]
          return (
            <div key={d.goal}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-foreground">
                  <span className="size-2 rounded-full" style={{ background: color }} />
                  {d.goal}
                </span>
                <span className="text-muted-foreground">
                  {d.count} · {total ? Math.round((d.count / total) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(d.count / max) * 100}%`, background: color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
