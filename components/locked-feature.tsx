'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'

export function LockedFeature({ title, missing }: { title: string; missing: string[] }) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Lock className="size-6" />
      </span>
      <div>
        <h2 className="text-base font-bold">{title} is locked</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Finish {missing.join(' and ')} first — that&apos;s where your real numbers and your
          rights are established, and everything here builds on them.
        </p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-2">
        {missing.includes('Know Yourself') && (
          <Link
            href="/know-yourself"
            className="rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Complete Know Yourself
          </Link>
        )}
        {missing.includes('Know Your Rights') && (
          <Link
            href="/rights"
            className="rounded-lg border border-border py-2.5 text-sm font-semibold text-foreground"
          >
            Complete Know Your Rights
          </Link>
        )}
      </div>
    </div>
  )
}
