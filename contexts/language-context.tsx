'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { translate, type LanguageCode } from '@/lib/i18n'
import { supabase } from '@/lib/supabase'
import { useUser } from './user-context'

const STORAGE_KEY = '1st-buyer-language'

type LanguageContextValue = {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en')
  const { profile } = useUser()

  // Load saved preference on mount (localStorage first for instant effect,
  // then reconcile with the signed-in profile's saved language).
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as LanguageCode | null
    if (stored) setLanguageState(stored)
  }, [])

  useEffect(() => {
    if (profile?.language) {
      setLanguageState(profile.language)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id])

  const setLanguage = useCallback(
    (lang: LanguageCode) => {
      setLanguageState(lang)
      window.localStorage.setItem(STORAGE_KEY, lang)
      if (supabase && profile) {
        supabase.from('profiles').update({ language: lang }).eq('id', profile.id).then(() => {})
      }
    },
    [profile],
  )

  const t = useCallback((key: string) => translate(key, language), [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}
