'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { UserProfile } from '@/lib/data'
import type { LanguageCode } from '@/lib/i18n'

function mapProfile(row: any): UserProfile {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    memberSince: row.member_since,
    province: row.province,
    city: row.city,
    employmentStatus: row.employment_status,
    monthlyIncome: row.monthly_income,
    buyingGoal: row.buying_goal,
    creditScore: row.credit_score,
    creditBureau: row.credit_bureau,
    buyingPower: row.buying_power,
    journeyProgress: row.journey_progress,
    savedListings: row.saved_listings,
    dateOfBirth: row.date_of_birth ?? null,
    licenseIssuedDate: row.license_issued_date ?? null,
    expenseRent: row.expense_rent ?? 0,
    expenseChildSupport: row.expense_child_support ?? 0,
    expenseLoanRepayments: row.expense_loan_repayments ?? 0,
    expenseGroceries: row.expense_groceries ?? 0,
    expenseOther: row.expense_other ?? 0,
    selectedCarId: row.selected_car_id ?? null,
    rightsAcknowledged: row.rights_acknowledged ?? false,
    rightsAcknowledgedAt: row.rights_acknowledged_at ?? null,
    language: (row.language ?? 'en') as LanguageCode,
  }
}

type UserContextValue = {
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    if (!supabase) return
    const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle()
    setProfile(data ? mapProfile(data) : null)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (session?.user) await fetchProfile(session.user.id)
  }, [session, fetchProfile])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      if (data.session?.user) await fetchProfile(data.session.user.id)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      if (newSession?.user) {
        await fetchProfile(newSession.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => sub.subscription.unsubscribe()
  }, [fetchProfile])

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
  }

  return (
    <UserContext.Provider value={{ session, profile, loading, refreshProfile, signOut }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within a UserProvider')
  return ctx
}
