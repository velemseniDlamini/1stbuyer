'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ExternalLink, Scale } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { useUser } from '@/contexts/user-context'
import { supabase } from '@/lib/supabase'

const rights = [
  {
    tag: 'NCA Section 81',
    title: 'Right to a responsible affordability assessment',
    body: 'Before granting you credit, a lender must assess whether you can actually afford it. If they don’t — and it turns out you couldn’t — a court can declare the credit "reckless" and set the agreement aside or restructure it in your favour.',
  },
  {
    tag: 'NCA Section 92–101',
    title: 'Right to full disclosure of the true cost of credit',
    body: 'You must be given a pre-agreement quotation showing the interest rate, initiation fee, service fees, credit insurance and the total cost of credit — in plain language, before you sign anything.',
  },
  {
    tag: 'NCA Section 62',
    title: 'Right to reasons if you’re declined',
    body: 'If a credit provider refuses your application, you can request the reasons for that decision in writing.',
  },
  {
    tag: 'NCA Section 86',
    title: 'Right to apply for debt review',
    body: 'If you’re over-indebted, you can apply to a debt counsellor for debt review, which can restructure your repayments so you can keep your assets and pay creditors over a longer, more manageable term.',
  },
  {
    tag: 'NCA Section 125–126',
    title: 'Right to settle early, without unreasonable penalty',
    body: 'You can pay off a credit agreement early at any time. The credit provider can only charge a settlement amount calculated using the statutory formula in the Act — not an arbitrary penalty.',
  },
  {
    tag: 'NCA Section 106',
    title: 'Right to choose your own credit life insurance',
    body: 'A dealer or lender cannot force you to buy their credit life insurance. You’re entitled to use an existing policy or shop around, as long as it provides equivalent cover.',
  },
  {
    tag: 'CPA Section 56',
    title: 'Right to a 6-month implied warranty on used goods',
    body: 'When you buy a used car from a registered dealer, the engine, gearbox and other essential components carry an implied 6-month warranty against defects — even if the agreement says "voetstoots" (sold as-is).',
  },
  {
    tag: 'CPA Section 22',
    title: 'Right to information in plain, understandable language',
    body: 'Contracts and disclosures must be written in plain language you can reasonably be expected to understand — not dense legal jargon designed to confuse you.',
  },
  {
    tag: 'CPA Section 48',
    title: 'Right to fair, just and reasonable terms',
    body: 'Contract terms that are excessively one-sided, unfair, or designed to exploit you are not enforceable, even if you signed them.',
  },
  {
    tag: 'Dispute resolution',
    title: 'Right to lodge a complaint',
    body: 'If a credit provider or dealer breaches these rights, you can lodge a complaint with the National Credit Regulator (credit issues) or the Motor Industry Ombudsman of South Africa (vehicle-specific disputes) — both are free to use.',
  },
]

const sources = [
  { label: 'National Credit Regulator (ncr.org.za)', url: 'https://www.ncr.org.za' },
  { label: 'National Consumer Commission (thencc.gov.za)', url: 'https://www.thencc.gov.za' },
  { label: 'Motor Industry Ombudsman of SA (miosa.co.za)', url: 'https://www.miosa.co.za' },
  { label: 'Consumer Protection Act — full text (gov.za)', url: 'https://www.gov.za/documents/consumer-protection-act' },
]

export default function RightsPage() {
  const { profile: user, refreshProfile } = useUser()
  const router = useRouter()
  const [checked, setChecked] = useState(false)
  const [saving, setSaving] = useState(false)

  if (!user) return null

  async function handleContinue() {
    if (!supabase || !user || !checked) return
    setSaving(true)
    await supabase
      .from('profiles')
      .update({ rights_acknowledged: true, rights_acknowledged_at: new Date().toISOString() })
      .eq('id', user.id)
    await refreshProfile()
    setSaving(false)
    router.push('/journey')
  }

  return (
    <div>
      <PageHeader title="Know your rights" subtitle="Step 2 of 6 — as a consumer & credit user in SA" />
      <div className="space-y-4 px-4 py-5">
        {user.rightsAcknowledged && (
          <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/5 p-3 text-sm text-success">
            <CheckCircle2 className="size-4 shrink-0" />
            You acknowledged these rights
            {user.rightsAcknowledgedAt && (
              <span className="text-muted-foreground">
                on {new Date(user.rightsAcknowledgedAt).toLocaleDateString('en-ZA')}
              </span>
            )}
          </div>
        )}

        <p className="text-sm leading-relaxed text-muted-foreground">
          Before you go dealership-hopping, know what the law already guarantees you. These are
          real rights under the National Credit Act (NCA) and Consumer Protection Act (CPA) — a
          dealer or lender cannot contract these away.
        </p>

        <div className="space-y-3">
          {rights.map((r) => (
            <div key={r.title} className="rounded-xl border border-border bg-card p-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
                <Scale className="size-3" /> {r.tag}
              </span>
              <p className="mt-2 text-sm font-semibold">{r.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{r.body}</p>
            </div>
          ))}
        </div>

        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-2 text-sm font-semibold">Read the official sources</h2>
          <div className="space-y-1.5">
            {sources.map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:border-primary/50"
              >
                {s.label}
                <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
              </a>
            ))}
          </div>
        </section>

        <label className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm">
          <input
            type="checkbox"
            checked={checked || user.rightsAcknowledged}
            disabled={user.rightsAcknowledged}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-primary"
          />
          <span>
            I have read and understood my rights as a consumer and credit user in South Africa.
          </span>
        </label>

        <button
          type="button"
          onClick={handleContinue}
          disabled={(!checked && !user.rightsAcknowledged) || saving}
          className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {saving ? 'Saving…' : user.rightsAcknowledged ? 'Continue' : 'I understand — continue'}
        </button>
      </div>
    </div>
  )
}
