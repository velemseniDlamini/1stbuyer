'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { useUser } from '@/contexts/user-context'
import { useSessionHeartbeat } from '@/lib/use-session-heartbeat'

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { session, profile, loading } = useUser()
  const router = useRouter()

  useSessionHeartbeat(session?.user.id)

  useEffect(() => {
    if (loading) return
    if (!session) {
      router.push('/login')
    } else if (!profile) {
      router.push('/onboarding')
    }
  }, [loading, session, profile, router])

  if (loading || !session || !profile) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  return <AppShell>{children}</AppShell>
}
