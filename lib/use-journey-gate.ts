'use client'

import { useCallback } from 'react'
import { useUser } from '@/contexts/user-context'
import { getExpenses, type Expense } from './db'
import { useDb } from './use-db'
import { validateKnowYourself, validateKnowRights } from './journey-validation'

// Gates features that depend on the user's real financial profile and their
// acknowledged consumer rights being in place first (Document Center, quote
// analysis, insurance comparison) — matches the same validation already used
// to drive journey stage 1 & 2 completion, so there's one source of truth.
export function useJourneyGate() {
  const { profile: user, loading: userLoading } = useUser()
  const fetchExpenses = useCallback(() => (user ? getExpenses(user.id) : Promise.resolve([])), [user])
  const { data: expenses, loading: expensesLoading } = useDb(fetchExpenses, [] as Expense[])

  if (userLoading || !user) {
    return { loading: true, unlocked: false, missing: [] as string[] }
  }

  const knowYourself = validateKnowYourself(user, expenses)
  const knowRights = validateKnowRights(user)
  const missing: string[] = []
  if (!knowYourself.complete) missing.push('Know Yourself')
  if (!knowRights.complete) missing.push('Know Your Rights')

  return { loading: expensesLoading, unlocked: missing.length === 0, missing }
}
