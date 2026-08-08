'use client'

import { JourneyMap } from '@/components/journey-map'
import { PageHeader } from '@/components/page-header'
import { getJourneyStages } from '@/lib/db'
import { journeyStages as fallbackJourneyStages } from '@/lib/data'
import { useDb } from '@/lib/use-db'
import { useUser } from '@/contexts/user-context'

export default function JourneyPage() {
  const { profile: user } = useUser()
  const { data: journeyStages } = useDb(getJourneyStages, fallbackJourneyStages)

  if (!user) return null

  return (
    <div>
      <PageHeader title="Your buying journey" subtitle="7 stages to a fair deal" back={false} />
      <div className="px-4 py-5">
        <div className="mb-6 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overall progress</p>
              <p className="text-3xl font-bold tabular-nums text-primary">{user.journeyProgress}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Est. completion</p>
              <p className="text-sm font-semibold">Late Feb 2026</p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${user.journeyProgress}%` }}
            />
          </div>
        </div>

        <JourneyMap stages={journeyStages} />
      </div>
    </div>
  )
}
