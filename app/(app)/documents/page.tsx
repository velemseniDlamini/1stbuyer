'use client'

import { useCallback, useRef, useState } from 'react'
import {
  Camera,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  ScanLine,
  ClipboardList,
} from 'lucide-react'
import { PageHeader, StatusBadge } from '@/components/page-header'
import { LockedFeature } from '@/components/locked-feature'
import { requiredDocs, type DocItem, type Quotation } from '@/lib/data'
import { getDocuments, addDocument, updateDocumentStatus, getQuotation, addQuotation } from '@/lib/db'
import { analyzeQuotation, type QuotationInput } from '@/lib/quotation-analysis'
import { useDb } from '@/lib/use-db'
import { useJourneyGate } from '@/lib/use-journey-gate'
import { useUser } from '@/contexts/user-context'
import { formatRand } from '@/lib/format'
import { cn } from '@/lib/utils'

type Tab = 'documents' | 'analysis'

export default function DocumentsPage() {
  const [tab, setTab] = useState<Tab>('documents')
  const gate = useJourneyGate()

  if (gate.loading) return null

  if (!gate.unlocked) {
    return (
      <div>
        <PageHeader title="Document center" subtitle="Upload, verify & analyse" />
        <LockedFeature title="Document Center" missing={gate.missing} />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Document center" subtitle="Upload, verify & analyse" />

      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
          {(['documents', 'analysis'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                'rounded-md py-2 text-sm font-semibold capitalize transition-colors',
                tab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
              )}
            >
              {t === 'documents' ? 'My Documents' : 'Quote Analysis'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'documents' ? <DocumentsTab /> : <AnalysisTab />}
    </div>
  )
}

function DocumentsTab() {
  const { profile } = useUser()
  const fetchDocs = useCallback(
    () => (profile ? getDocuments(profile.id) : Promise.resolve([])),
    [profile],
  )
  const { data: documents, loading } = useDb(fetchDocs, [] as DocItem[])
  const [localDocs, setLocalDocs] = useState<DocItem[]>([])
  const allDocs = [...documents, ...localDocs]
  const completed = Math.min(allDocs.filter((d) => d.status === 'valid').length, requiredDocs.length)
  const scanInputRef = useRef<HTMLInputElement>(null)
  const uploadInputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | null, type: string) {
    if (!files || files.length === 0 || !profile) return
    const file = files[0]
    const created = await addDocument(profile.id, {
      name: file.name,
      type,
      status: 'analysing',
      note: 'Just uploaded',
    })
    if (!created) return
    setLocalDocs((docs) => [...docs, created])
    setTimeout(async () => {
      await updateDocumentStatus(created.id, 'valid', 'Verified')
      setLocalDocs((docs) =>
        docs.map((d) => (d.id === created.id ? { ...d, status: 'valid', note: 'Verified' } : d)),
      )
    }, 1800)
  }

  return (
    <div className="space-y-6 px-4 py-5">
      {/* Upload actions */}
      <input
        ref={scanInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files, 'Scan')}
      />
      <input
        ref={uploadInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files, 'Upload')}
      />
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => scanInputRef.current?.click()}
          className="flex flex-col items-center gap-2 rounded-xl border border-primary/40 bg-primary/5 p-5 text-primary"
        >
          <Camera className="size-6" />
          <span className="text-sm font-semibold">Scan document</span>
          <span className="text-[11px] text-muted-foreground">Auto edge-detect</span>
        </button>
        <button
          type="button"
          onClick={() => uploadInputRef.current?.click()}
          className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5"
        >
          <Upload className="size-6 text-muted-foreground" />
          <span className="text-sm font-semibold">Upload file</span>
          <span className="text-[11px] text-muted-foreground">PDF, JPG, PNG</span>
        </button>
      </div>

      {/* Finance pack progress */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <ClipboardList className="size-4 text-primary" /> Finance Application Pack
          </span>
          <span className="text-xs text-muted-foreground">
            {completed}/{requiredDocs.length}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${(completed / requiredDocs.length) * 100}%` }}
          />
        </div>
        <ul className="mt-3 space-y-1.5">
          {requiredDocs.map((doc, i) => {
            const done = i < completed
            return (
              <li key={doc} className="flex items-center gap-2 text-xs">
                {done ? (
                  <CheckCircle2 className="size-4 shrink-0 text-success" />
                ) : (
                  <div className="size-4 shrink-0 rounded-full border border-border" />
                )}
                <span className={cn(done ? 'text-muted-foreground' : 'text-foreground')}>
                  {doc}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Document grid */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Your documents</h2>
        {!loading && allDocs.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            No documents yet — scan or upload one above to get started.
          </p>
        ) : (
          <div className="space-y-2">
            {allDocs.map((doc) => (
              <DocRow key={doc.id} doc={doc} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function DocRow({ doc }: { doc: DocItem }) {
  const status = {
    valid: { tone: 'success' as const, icon: CheckCircle2, label: doc.note ?? 'Valid' },
    expiring: { tone: 'warning' as const, icon: AlertTriangle, label: `Expires in ${doc.expiry}` },
    expired: { tone: 'danger' as const, icon: XCircle, label: doc.note ?? 'Expired' },
    analysing: { tone: 'gold' as const, icon: Loader2, label: 'Analysing…' },
  }[doc.status]
  const Icon = status.icon
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <FileText className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{doc.name}</p>
        <p className="text-xs text-muted-foreground">{doc.type}</p>
      </div>
      <StatusBadge tone={status.tone}>
        <Icon className={cn('size-3', doc.status === 'analysing' && 'animate-spin')} />
        <span className="hidden xs:inline">{status.label}</span>
      </StatusBadge>
    </div>
  )
}

const emptyForm: QuotationInput = {
  vehicle: '',
  vehiclePrice: 300000,
  deposit: 30000,
  termMonths: 72,
  interestRate: 13,
  adminFee: 3500,
  creditLifeFee: 4000,
  trackingFee: 2400,
  balloonPct: 0,
}

function AnalysisTab() {
  const { profile } = useUser()
  const fetchQuotation = useCallback(
    () => (profile ? getQuotation(profile.id) : Promise.resolve(null)),
    [profile],
  )
  const { data: quotation, loading } = useDb(fetchQuotation, null as Quotation | null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<QuotationInput>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [savedQuotation, setSavedQuotation] = useState<Quotation | null>(null)

  const active = savedQuotation ?? quotation

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    const { fees, redFlags } = analyzeQuotation(form, profile.creditScore)
    const newQuotation: Quotation = {
      vehicle: form.vehicle,
      vehiclePrice: form.vehiclePrice,
      deposit: form.deposit,
      termMonths: form.termMonths,
      interestRate: form.interestRate,
      balloonPct: form.balloonPct,
      fees,
      redFlags,
    }
    const ok = await addQuotation(profile.id, newQuotation)
    setSaving(false)
    if (ok) {
      setSavedQuotation(newQuotation)
      setShowForm(false)
    }
  }

  if (loading) return null

  if (!active || showForm) {
    return (
      <div className="px-4 py-5">
        <p className="mb-4 text-sm text-muted-foreground">
          Enter the details from a dealer quotation and Guardian will flag anything priced above
          market norms.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <FormField label="Vehicle (make, model, year)">
            <input
              required
              value={form.vehicle}
              onChange={(e) => setForm((f) => ({ ...f, vehicle: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              placeholder="Toyota Corolla Cross 1.8 XS (2023)"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Vehicle price">
              <NumberInput value={form.vehiclePrice} onChange={(v) => setForm((f) => ({ ...f, vehiclePrice: v }))} />
            </FormField>
            <FormField label="Deposit">
              <NumberInput value={form.deposit} onChange={(v) => setForm((f) => ({ ...f, deposit: v }))} />
            </FormField>
            <FormField label="Term (months)">
              <NumberInput value={form.termMonths} onChange={(v) => setForm((f) => ({ ...f, termMonths: v }))} />
            </FormField>
            <FormField label="Interest rate (%)">
              <NumberInput
                value={form.interestRate}
                step={0.05}
                onChange={(v) => setForm((f) => ({ ...f, interestRate: v }))}
              />
            </FormField>
            <FormField label="Admin fee">
              <NumberInput value={form.adminFee} onChange={(v) => setForm((f) => ({ ...f, adminFee: v }))} />
            </FormField>
            <FormField label="Credit life insurance">
              <NumberInput
                value={form.creditLifeFee}
                onChange={(v) => setForm((f) => ({ ...f, creditLifeFee: v }))}
              />
            </FormField>
            <FormField label="Tracking device">
              <NumberInput value={form.trackingFee} onChange={(v) => setForm((f) => ({ ...f, trackingFee: v }))} />
            </FormField>
            <FormField label="Balloon (%)">
              <NumberInput value={form.balloonPct} onChange={(v) => setForm((f) => ({ ...f, balloonPct: v }))} />
            </FormField>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {saving ? 'Analysing…' : 'Analyse quotation'}
          </button>
          {active && (
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="w-full rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground"
            >
              Cancel
            </button>
          )}
        </form>
      </div>
    )
  }

  const financed =
    active.vehiclePrice -
    active.deposit +
    active.fees.filter((f) => f.label !== 'Vehicle price').reduce((a, f) => a + f.amount, 0)

  return (
    <div className="space-y-6 px-4 py-5">
      {/* Scan animation card */}
      <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
        <ScanLine className="size-5 text-primary" />
        <div className="text-sm">
          <p className="font-semibold">{active.vehicle}</p>
          <p className="text-xs text-muted-foreground">
            Quotation analysed · {active.redFlags.length} finding{active.redFlags.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {/* Line items */}
      <section className="overflow-hidden rounded-xl border border-border">
        <div className="border-b border-border bg-card px-4 py-2.5 text-xs font-semibold text-muted-foreground">
          Line-item breakdown vs. benchmark
        </div>
        {active.fees.map((f, i) => (
          <div
            key={f.label}
            className={cn(
              'flex items-center justify-between bg-card px-4 py-3',
              i > 0 && 'border-t border-border',
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'size-2 rounded-full',
                  f.flag === 'high' ? 'bg-destructive' : 'bg-success',
                )}
              />
              <span className="text-sm">{f.label}</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold tabular-nums">{formatRand(f.amount)}</p>
              {f.flag === 'high' && (
                <p className="text-[11px] text-destructive">
                  norm {formatRand(f.benchmark)}
                </p>
              )}
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-border bg-muted px-4 py-3">
          <span className="text-sm font-semibold">Financed amount</span>
          <span className="text-sm font-bold tabular-nums text-primary">
            {formatRand(financed)}
          </span>
        </div>
      </section>

      {/* Red flags */}
      <section>
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
          <AlertTriangle className="size-4 text-warning" /> Guardian&apos;s findings
        </h2>
        <div className="space-y-2">
          {active.redFlags.map((flag, i) => (
            <div
              key={i}
              className="flex gap-2.5 rounded-xl border border-warning/30 bg-warning/5 p-3 text-sm"
            >
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-warning text-[11px] font-bold text-warning-foreground">
                {i + 1}
              </span>
              <p className="leading-relaxed">{flag}</p>
            </div>
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={() => downloadNegotiationPoints(active, financed)}
        className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground"
      >
        Generate negotiation points
      </button>
      <button
        type="button"
        onClick={() => {
          setForm(emptyForm)
          setShowForm(true)
        }}
        className="w-full rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground"
      >
        Analyse a different quotation
      </button>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

function NumberInput({
  value,
  onChange,
  step = 1,
}: {
  value: number
  onChange: (v: number) => void
  step?: number
}) {
  return (
    <input
      type="number"
      required
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
    />
  )
}

function downloadNegotiationPoints(quotation: Quotation, financed: number) {
  const lines = [
    `1st Buyer — Negotiation Points`,
    `Vehicle: ${quotation.vehicle}`,
    ``,
    `Line-item breakdown:`,
    ...quotation.fees.map(
      (f) =>
        `  - ${f.label}: ${formatRand(f.amount)}${f.flag === 'high' ? ` (benchmark ${formatRand(f.benchmark)} — above market)` : ''}`,
    ),
    `  Financed amount: ${formatRand(financed)}`,
    ``,
    `Guardian's findings:`,
    ...quotation.redFlags.map((f, i) => `  ${i + 1}. ${f}`),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'negotiation-points.txt'
  a.click()
  URL.revokeObjectURL(url)
}
