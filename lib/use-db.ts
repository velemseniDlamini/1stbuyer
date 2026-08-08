'use client'

import { useEffect, useState } from 'react'

export function useDb<T>(fetcher: () => Promise<T>, initial: T) {
  const [data, setData] = useState<T>(initial)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetcher().then((result) => {
      if (!cancelled) {
        setData(result)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { data, loading }
}
