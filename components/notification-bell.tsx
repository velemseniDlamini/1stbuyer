'use client'

import { useState } from 'react'
import { Bell, FileText, ShieldCheck, Car, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const notifications = [
  { icon: FileText, title: 'Sale agreement uploaded', meta: 'AI analysis running · 2h ago' },
  { icon: ShieldCheck, title: 'Guardian answered your CPA question', meta: 'Yesterday' },
  { icon: Car, title: 'Toyota Corolla Cross saved', meta: 'Motus Sandton · 2 days ago' },
]

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [read, setRead] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v)
          setRead(true)
        }}
        aria-label="Notifications"
        className="relative flex size-9 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-muted"
      >
        <Bell className="size-5" />
        {!read && (
          <span className="absolute right-2 top-2 size-2 rounded-full bg-primary" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-72 rounded-xl border border-border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
              <span className="text-sm font-semibold">Notifications</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close">
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>
            <div className="divide-y divide-border">
              {notifications.map((n, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                  <span
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground',
                    )}
                  >
                    <n.icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">{n.title}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{n.meta}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
