'use client'

import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, AlertTriangle, Lock, Trash2, Plus } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { useUser } from '@/contexts/user-context'
import { supabase } from '@/lib/supabase'
import { getExpenses, addExpense, updateExpense, deleteExpense, type Expense } from '@/lib/db'
import { useDb } from '@/lib/use-db'
import { validateKnowYourself } from '@/lib/journey-validation'
import { assessAffordability } from '@/lib/finance-estimate'
import { provinces, type EmploymentStatus, type BuyingGoal } from '@/lib/data'
import { formatRand } from '@/lib/format'

const employmentOptions: EmploymentStatus[] = [
  'Permanently employed',
  'Contract employed',
  'Self-employed',
  'Unemployed',
]

const goals: { value: BuyingGoal; label: string }[] = [
  { value: 'first-time', label: 'First-time buyer' },
  { value: 'trade-in', label: 'Trading in a vehicle' },
  { value: 'replacing', label: 'Replacing a vehicle (no trade-in)' },
  { value: 'additional', label: 'Adding another vehicle' },
  { value: 'browsing', label: 'Just browsing' },
]

export default function KnowYourselfPage() {
  const { profile: user, refreshProfile } = useUser()
  const fetchExpenses = useCallback(() => (user ? getExpenses(user.id) : Promise.resolve([])), [user])
  const { data: fetchedExpenses, loading: expensesLoading } = useDb(fetchExpenses, [] as Expense[])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [expensesInitialised, setExpensesInitialised] = useState(false)

  useEffect(() => {
    if (!expensesInitialised && !expensesLoading) {
      setExpenses(fetchedExpenses)
      setExpensesInitialised(true)
    }
  }, [fetchedExpenses, expensesLoading, expensesInitialised])

  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>('Permanently employed')
  const [monthlyIncome, setMonthlyIncome] = useState('')
  const [buyingGoal, setBuyingGoal] = useState<BuyingGoal>('first-time')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState(provinces[0])
  const [dob, setDob] = useState('')
  const [licenseDate, setLicenseDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    setEmploymentStatus(user.employmentStatus)
    setMonthlyIncome(user.monthlyIncome ? String(user.monthlyIncome) : '')
    setBuyingGoal(user.buyingGoal)
    setCity(user.city)
    setProvince(user.province)
    setDob(user.dateOfBirth ?? '')
    setLicenseDate(user.licenseIssuedDate ?? '')
  }, [user])

  if (!user) return null

  const validation = validateKnowYourself(
    { ...user, monthlyIncome: Number(monthlyIncome) || 0, dateOfBirth: dob || null, licenseIssuedDate: licenseDate || null },
    expenses,
  )
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const affordability = assessAffordability(
    { ...user, monthlyIncome: Number(monthlyIncome) || 0, dateOfBirth: dob || null, licenseIssuedDate: licenseDate || null },
    totalExpenses,
  )

  const dobLocked = !!user.dateOfBirth
  const licenseLocked = !!user.licenseIssuedDate

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase || !user) return
    setSaving(true)
    setSaved(false)

    const update: Record<string, unknown> = {
      employment_status: employmentStatus,
      monthly_income: Number(monthlyIncome) || 0,
      buying_goal: buyingGoal,
      city,
      province,
    }
    // Date fields lock permanently once set — only send them while still empty.
    if (!dobLocked && dob) update.date_of_birth = dob
    if (!licenseLocked && licenseDate) update.license_issued_date = licenseDate

    const newAffordability = assessAffordability(
      { ...user, monthlyIncome: Number(monthlyIncome) || 0 },
      totalExpenses,
    )
    update.buying_power = Math.round(newAffordability.maxVehiclePrice)

    await supabase.from('profiles').update(update).eq('id', user.id)
    await refreshProfile()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function handleAddExpense() {
    if (!user) return
    const created = await addExpense(user.id, '', 0)
    if (created) setExpenses((prev) => [...prev, created])
  }

  function handleExpenseUpdated(id: string, label: string, amount: number) {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, label, amount } : e)))
  }

  async function handleRemoveExpense(id: string) {
    const ok = await deleteExpense(id)
    if (ok) setExpenses((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <div>
      <PageHeader title="Know yourself" subtitle="Step 1 of 7 — your real affordability picture" />
      <div className="space-y-6 px-4 py-5">
        {/* Validation banner */}
        <div
          className={`rounded-xl border p-4 text-sm ${
            validation.complete ? 'border-success/40 bg-success/5' : 'border-warning/40 bg-warning/5'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            {validation.complete ? (
              <>
                <CheckCircle2 className="size-4 text-success" />
                <span className="text-success">Complete — this step is marked done</span>
              </>
            ) : (
              <>
                <AlertTriangle className="size-4 text-warning" />
                <span className="text-warning">Not complete yet</span>
              </>
            )}
          </div>
          {!validation.complete && (
            <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-muted-foreground">
              {validation.missing.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Employment & income */}
          <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Employment & income</h2>
            <Field label="Employment status">
              <select
                value={employmentStatus}
                onChange={(e) => setEmploymentStatus(e.target.value as EmploymentStatus)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                {employmentOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </Field>
            <Field label="Net monthly income — take-home pay (ZAR)">
              <input
                type="number"
                min={0}
                required
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="After tax and deductions, not gross"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="City">
                <input
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
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          {/* Dates — lock once set */}
          <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Age & license history</h2>
            <p className="text-xs text-muted-foreground">
              Used to estimate finance rates. Once saved, these can&apos;t be changed here — contact
              support if you made a mistake.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Date of birth">
                <div className="relative">
                  <input
                    type="date"
                    required
                    disabled={dobLocked}
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary disabled:opacity-60"
                  />
                  {dobLocked && (
                    <Lock className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  )}
                </div>
              </Field>
              <Field label="License issued">
                <div className="relative">
                  <input
                    type="date"
                    required
                    disabled={licenseLocked}
                    value={licenseDate}
                    onChange={(e) => setLicenseDate(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary disabled:opacity-60"
                  />
                  {licenseLocked && (
                    <Lock className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  )}
                </div>
              </Field>
            </div>
          </section>

          {/* Buying goal */}
          <section className="space-y-2 rounded-2xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Buying goal</h2>
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
          </section>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
          </button>
        </form>

        {/* Expenses — unlimited entries */}
        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Monthly expenses</h2>
            <span className="text-xs text-muted-foreground">Total: {formatRand(totalExpenses)}</span>
          </div>
          {!expensesLoading && expenses.length === 0 && (
            <p className="mb-3 text-xs text-muted-foreground">
              No expenses added yet — add every regular monthly cost (rent, debt, groceries, etc.) for
              an accurate affordability picture.
            </p>
          )}
          <div className="space-y-2">
            {expenses.map((exp) => (
              <ExpenseRow
                key={exp.id}
                expense={exp}
                onUpdated={(label, amount) => handleExpenseUpdated(exp.id, label, amount)}
                onRemove={() => handleRemoveExpense(exp.id)}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddExpense}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground hover:border-primary/50 hover:text-primary"
          >
            <Plus className="size-4" /> Add expense
          </button>
        </section>

        {/* Affordability preview */}
        {Number(monthlyIncome) > 0 && (
          <div
            className={`rounded-xl border p-4 text-sm leading-relaxed ${
              affordability.qualifies ? 'border-success/40 bg-success/5' : 'border-warning/40 bg-warning/5'
            }`}
          >
            <p className="text-muted-foreground">
              Disposable income: <span className="font-medium text-foreground">{formatRand(affordability.disposableIncome)}</span>/mo
            </p>
            <p className="mt-1 text-muted-foreground">{affordability.reason}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ExpenseRow({
  expense,
  onUpdated,
  onRemove,
}: {
  expense: Expense
  onUpdated: (label: string, amount: number) => void
  onRemove: () => void
}) {
  const [label, setLabel] = useState(expense.label)
  const [amount, setAmount] = useState(String(expense.amount))
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    const parsedAmount = Number(amount) || 0
    await updateExpense(expense.id, label, parsedAmount)
    onUpdated(label, parsedAmount)
    setSaving(false)
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onBlur={save}
        placeholder="e.g. Rent"
        className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
      <input
        type="number"
        min={0}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        onBlur={save}
        placeholder="0"
        className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove expense"
        className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-destructive/50 hover:text-destructive"
      >
        <Trash2 className="size-4" />
      </button>
      {saving && <span className="sr-only">Saving…</span>}
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
