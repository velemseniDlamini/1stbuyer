import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { type BuyingGoal } from '@/lib/data'

const MONTHS_BACK = 6

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(d: Date) {
  return d.toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })
}

function lastNMonths(n: number) {
  const now = new Date()
  const months: { key: string; label: string }[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ key: monthKey(d), label: monthLabel(d) })
  }
  return months
}

function bucketByMonth(dates: string[], months: { key: string; label: string }[]) {
  const counts = new Map(months.map((m) => [m.key, 0]))
  for (const iso of dates) {
    const key = monthKey(new Date(iso))
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return months.map((m) => ({ month: m.label, count: counts.get(m.key) ?? 0 }))
}

function bucketDistinctUsersByMonth(
  rows: { user_id: string; started_at: string }[],
  months: { key: string; label: string }[],
) {
  const usersByMonth = new Map(months.map((m) => [m.key, new Set<string>()]))
  for (const row of rows) {
    const key = monthKey(new Date(row.started_at))
    usersByMonth.get(key)?.add(row.user_id)
  }
  return months.map((m) => ({ month: m.label, count: usersByMonth.get(m.key)?.size ?? 0 }))
}

const goalLabels: Record<BuyingGoal, string> = {
  'first-time': 'First-time buyer',
  'trade-in': 'Trading in',
  replacing: 'Replacing (no trade-in)',
  additional: 'Adding another',
  browsing: 'Just browsing',
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  let admin
  try {
    admin = getSupabaseAdmin()
  } catch {
    return NextResponse.json({ error: 'Admin stats are not configured' }, { status: 500 })
  }

  const { data: userData, error: userError } = await admin.auth.getUser(token)
  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail || userData.user.email !== adminEmail) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const months = lastNMonths(MONTHS_BACK)

  const [profilesRes, loginEventsRes, sessionsRes] = await Promise.all([
    admin.from('profiles').select('created_at, buying_goal'),
    admin.from('login_events').select('created_at'),
    admin.from('sessions').select('user_id, started_at, last_seen_at'),
  ])

  const profiles = profilesRes.data ?? []
  const loginEvents = loginEventsRes.data ?? []
  const sessions = sessionsRes.data ?? []

  const signupsByMonth = bucketByMonth(profiles.map((p) => p.created_at), months)
  const loginsByMonth = bucketByMonth(loginEvents.map((e) => e.created_at), months)
  const activeUsersByMonth = bucketDistinctUsersByMonth(sessions, months)

  const goalCounts = new Map<string, number>()
  for (const p of profiles) {
    const label = goalLabels[p.buying_goal as BuyingGoal] ?? p.buying_goal
    goalCounts.set(label, (goalCounts.get(label) ?? 0) + 1)
  }
  const buyingGoalBreakdown = [...goalCounts.entries()].map(([goal, count]) => ({ goal, count }))

  const durationsMs = sessions
    .map((s) => new Date(s.last_seen_at).getTime() - new Date(s.started_at).getTime())
    .filter((ms) => ms > 0)
  const avgSessionMinutes = durationsMs.length
    ? Math.round((durationsMs.reduce((a, b) => a + b, 0) / durationsMs.length / 60000) * 10) / 10
    : 0

  return NextResponse.json({
    totalUsers: profiles.length,
    signupsByMonth,
    loginsByMonth,
    activeUsersByMonth,
    buyingGoalBreakdown,
    avgSessionMinutes,
    totalSessions: sessions.length,
    totalLogins: loginEvents.length,
  })
}
