'use client'

import { useState } from 'react'
import { Languages, Check } from 'lucide-react'
import { languages } from '@/lib/i18n'
import { useLanguage } from '@/contexts/language-context'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  const [open, setOpen] = useState(false)
  const current = languages.find((l) => l.code === language) ?? languages[0]

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        className="flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Languages className="size-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-44 rounded-xl border border-border bg-card shadow-lg">
            <div className="border-b border-border px-3 py-2 text-xs font-semibold text-muted-foreground">
              Language
            </div>
            <div className="py-1">
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => {
                    setLanguage(l.code)
                    setOpen(false)
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  {l.nativeLabel}
                  {language === l.code && <Check className="size-3.5 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
