'use client'

import { useEffect, useRef } from 'react'
import { pingSession } from './db'

const PING_INTERVAL_MS = 60_000

// Real, honest session-length measurement: one row per browser tab session,
// upserted every ~60s while the tab is visible. Duration is derived later
// (admin stats) as last_seen_at - started_at. Pauses while the tab is
// backgrounded so idle-but-open tabs don't inflate numbers.
export function useSessionHeartbeat(userId: string | undefined) {
  const sessionIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!userId) return
    if (!sessionIdRef.current) sessionIdRef.current = crypto.randomUUID()
    const sessionId = sessionIdRef.current

    function ping() {
      if (document.visibilityState === 'visible') {
        pingSession(sessionId, userId!)
      }
    }

    ping()
    const interval = setInterval(ping, PING_INTERVAL_MS)
    document.addEventListener('visibilitychange', ping)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', ping)
    }
  }, [userId])
}
