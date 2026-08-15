'use client'

import { useCallback } from 'react'
import { JourneyMap } from '@/components/journey-map'
import { PageHeader } from '@/components/page-header'
import { getJourneyStages, getExpenses } from '@/lib/db'
import { journeyStages as fallbackJourneyStages, deriveStageStatuses } from '@/lib/data'
import { validateKnowYourself, validateKnowRights } from '@/lib/journey-validation'
import { useDb } from '@/lib/use-db'
import { useUser } from '@/contexts/user-context'

export default function JourneyPage() {
  const { profile: user } = useUser()
  const { data: rawStages } = useDb(getJourneyStages, fallbackJourneyStages)
  const fetchExpenses = useCallback(() => (user ? getExpenses(user.id) : Promise.resolve([])), [user])
  const { data: expenses } = useDb(fetchExpenses, [])

  if (!user) return null

  const journeyStages = deriveStageStatuses(rawStages, {
    knowYourselfComplete: validateKnowYourself(user, expenses).complete,
    rightsComplete: validateKnowRights(user).complete,
  })
  const completedCount = journeyStages.filter((s) => s.status === 'completed').length
  const progressPct = Math.round((completedCount / journeyStages.length) * 100)

  return (
    <div>
      <PageHeader title="Your buying journey" subtitle={`${journeyStages.length} stages to a fair deal`} back={false} />
      <div className="px-4 py-5">
        <div className="mb-6 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overall progress</p>
              <p className="text-3xl font-bold tabular-nums text-primary">{progressPct}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Stages complete</p>
              <p className="text-sm font-semibold">{completedCount} of {journeyStages.length}</p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <JourneyMap stages={journeyStages} />
      </div>
    </div>
  )
}
