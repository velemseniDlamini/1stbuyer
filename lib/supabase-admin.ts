import { createClient } from '@supabase/supabase-js'

// Server-only. Bypasses RLS entirely — never import this from a 'use client'
// component or any code path reachable without the caller-identity check in
// app/api/admin/**. The service role key must never reach the browser.
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase admin client is not configured')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}
