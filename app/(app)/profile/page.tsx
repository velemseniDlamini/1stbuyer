'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/theme-provider'
import {
  User,
  MapPin,
  Briefcase,
  Wallet,
  Moon,
  Sun,
  Bell,
  ShieldCheck,
  FileText,
  HelpCircle,
  LogOut,
  ChevronRight,
  Target,
} from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { useUser } from '@/contexts/user-context'
import { supabase } from '@/lib/supabase'
import { formatRand } from '@/lib/format'

const goalLabels: Record<string, string> = {
  'first-time': 'First-time buyer',
  'trade-in': 'Trading in a vehicle',
  replacing: 'Replacing a vehicle',
  additional: 'Adding another vehicle',
  browsing: 'Just browsing',
}

export default function ProfilePage() {
  const { profile: user, signOut, refreshProfile } = useUser()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme !== 'light'
  const router = useRouter()
  const [notifications, setNotifications] = useState(true)
  const [guardianAlerts, setGuardianAlerts] = useState(true)
  const [editingDetails, setEditingDetails] = useState(false)
  const [dob, setDob] = useState(user?.dateOfBirth ?? '')
  const [licenseDate, setLicenseDate] = useState(user?.licenseIssuedDate ?? '')
  const [savingDates, setSavingDates] = useState(false)

  if (!user) return null

  async function saveDates() {
    if (!supabase || !user) return
    setSavingDates(true)
    await supabase
      .from('profiles')
      .update({ date_of_birth: dob || null, license_issued_date: licenseDate || null })
      .eq('id', user.id)
    await refreshProfile()
    setSavingDates(false)
  }

  return (
    <div>
      <PageHeader title="Profile" subtitle="Account & preferences" />
      <div className="space-y-6 px-4 py-5">
        {/* Identity */}
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm text-muted-foreground">Member since {user.memberSince}</p>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary">
              <ShieldCheck className="size-3" /> Guardian Protected
            </span>
          </div>
        </div>

        {/* Buyer profile */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Buyer profile</h3>
          <div className="grid grid-cols-2 gap-3">
            <InfoTile icon={Target} label="Goal" value={goalLabels[user.buyingGoal]} />
            <InfoTile icon={Wallet} label="Monthly income" value={formatRand(user.monthlyIncome)} />
            <InfoTile icon={Briefcase} label="Employment" value={user.employmentStatus} />
            <InfoTile icon={MapPin} label="Location" value={`${user.city}, ${user.province}`} />
          </div>
        </section>

        {/* Preferences */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Preferences</h3>
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-muted"
            >
              <span className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
                </span>
                <span className="text-sm font-medium">Dark mode</span>
              </span>
              <span
                role="switch"
                aria-checked={isDark}
                className={`relative h-6 w-11 rounded-full transition-colors ${isDark ? 'bg-primary' : 'bg-muted-foreground/30'}`}
              >
                <span
                  className={`absolute top-0.5 size-5 rounded-full bg-background transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0.5'}`}
                />
              </span>
            </button>
            <Row
              icon={Bell}
              label="Notifications"
              trailing={notifications ? 'On' : 'Off'}
              onClick={() => setNotifications((v) => !v)}
            />
            <Row
              icon={ShieldCheck}
              label="Guardian alerts"
              trailing={guardianAlerts ? 'On' : 'Off'}
              onClick={() => setGuardianAlerts((v) => !v)}
            />
          </div>
        </section>

        {/* Account */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Account</h3>
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            <Row icon={FileText} label="My documents" chevron onClick={() => router.push('/documents')} />
            <Row
              icon={User}
              label="Personal details"
              chevron
              onClick={() => setEditingDetails((v) => !v)}
            />
            <Row icon={HelpCircle} label="Help & support" chevron onClick={() => router.push('/chat')} />
          </div>
          {editingDetails && (
            <div className="mt-2 space-y-2 rounded-xl border border-border bg-card p-4 text-sm">
              <Detail label="Name" value={`${user.firstName} ${user.lastName}`} />
              <Detail label="Goal" value={goalLabels[user.buyingGoal]} />
              <Detail label="Employment" value={user.employmentStatus} />
              <Detail label="Monthly income" value={formatRand(user.monthlyIncome)} />
              <Detail label="Location" value={`${user.city}, ${user.province}`} />
              <p className="pt-1 text-[11px] text-muted-foreground">
                To change the above, update your Supabase <code>profiles</code> row directly for
                now — in-app editing isn't wired up yet.
              </p>

              <div className="mt-3 space-y-2 border-t border-border pt-3">
                <p className="text-xs font-medium text-foreground">
                  Used for estimated finance rates on listings
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-[11px] text-muted-foreground">Date of birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-2 py-2 text-xs outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-muted-foreground">License issued</label>
                    <input
                      type="date"
                      value={licenseDate}
                      onChange={(e) => setLicenseDate(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-2 py-2 text-xs outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={saveDates}
                  disabled={savingDates}
                  className="w-full rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {savingDates ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </section>

        <button
          type="button"
          onClick={async () => {
            await signOut()
            router.push('/login')
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="size-4" /> Sign out
        </button>

        <p className="pb-2 text-center text-xs text-muted-foreground">
          1st Buyer · v1.0 · Not affiliated with any dealership or bank
        </p>
      </div>
    </div>
  )
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Target
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </span>
      <p className="mt-1 text-sm font-semibold leading-tight">{value}</p>
    </div>
  )
}

function Row({
  icon: Icon,
  label,
  trailing,
  chevron,
  onClick,
}: {
  icon: typeof Bell
  label: string
  trailing?: string
  chevron?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-muted"
    >
      <span className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </span>
        <span className="text-sm font-medium">{label}</span>
      </span>
      {trailing && <span className="text-sm text-muted-foreground">{trailing}</span>}
      {chevron && <ChevronRight className="size-4 text-muted-foreground" />}
    </button>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
