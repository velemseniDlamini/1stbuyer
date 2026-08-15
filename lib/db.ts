import { supabase } from './supabase'
import {
  journeyStages as fallbackJourneyStages,
  tips as fallbackTips,
  insuranceProviders as fallbackInsuranceProviders,
  dealers as fallbackDealers,
  cars as fallbackCars,
  type Stage,
  type Provider,
  type Dealer,
  type Car,
  type DocItem,
  type Quotation,
} from './data'

// Shared catalog data (dealers, cars, insurance, journey content, tips) tries
// Supabase first and falls back to bundled mock data if the table doesn't
// exist yet — so the app keeps working before/without the DB migration.
//
// Per-user data (credit history, documents, quotations) is scoped by
// profile_id and has NO demo fallback: an empty result for a real user is a
// legitimate state (they just haven't added anything yet), not an error.

export type Expense = { id: string; label: string; amount: number }

export async function getExpenses(profileId: string): Promise<Expense[]> {
  if (!supabase) return []
  const { data } = await supabase
    .from('expenses')
    .select('id, label, amount')
    .eq('profile_id', profileId)
    .order('id', { ascending: true })
  return (data ?? []).map((e) => ({ id: String(e.id), label: e.label, amount: e.amount }))
}

export async function addExpense(profileId: string, label: string, amount: number): Promise<Expense | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('expenses')
    .insert({ profile_id: profileId, label, amount })
    .select('id, label, amount')
    .single()
  if (error || !data) return null
  return { id: String(data.id), label: data.label, amount: data.amount }
}

export async function updateExpense(id: string, label: string, amount: number): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.from('expenses').update({ label, amount }).eq('id', id)
  return !error
}

export async function deleteExpense(id: string): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  return !error
}

export async function getCreditHistory(profileId: string) {
  if (!supabase) return []
  const { data } = await supabase
    .from('credit_history')
    .select('month, score')
    .eq('profile_id', profileId)
    .order('sort_order', { ascending: true })
  return data ?? []
}

// Records a score the user checked themselves on a real bureau's own site
// (TransUnion MyCreditCheck, Experian, Compuscan, XDS) and typed in here.
// There is no live bureau API this app can call on your behalf.
export async function recordCreditCheck(profileId: string, score: number, bureau: string) {
  if (!supabase) return false

  const { count } = await supabase
    .from('credit_history')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', profileId)

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ credit_score: score, credit_bureau: bureau })
    .eq('id', profileId)
  if (profileError) return false

  const month = new Date().toLocaleDateString('en-ZA', { month: 'short' })
  const { error: historyError } = await supabase.from('credit_history').insert({
    profile_id: profileId,
    month,
    score,
    sort_order: (count ?? 0) + 1,
  })

  return !historyError
}

export async function getJourneyStages(): Promise<Stage[]> {
  if (!supabase) return fallbackJourneyStages
  const { data, error } = await supabase.from('journey_stages').select('*').order('id', { ascending: true })
  if (error || !data || data.length === 0) return fallbackJourneyStages
  return data.map((s) => ({
    id: s.id,
    key: s.key,
    title: s.title,
    tagline: s.tagline,
    description: s.description,
    time: s.time,
    status: s.status,
    actions: s.actions,
    href: s.href ?? undefined,
  }))
}

export async function getTips() {
  if (!supabase) return fallbackTips
  const { data, error } = await supabase.from('tips').select('tag, text')
  if (error || !data || data.length === 0) return fallbackTips
  return data
}

export async function getInsuranceProviders(): Promise<Provider[]> {
  if (!supabase) return fallbackInsuranceProviders
  const { data, error } = await supabase.from('insurance_providers').select('*').order('id', { ascending: true })
  if (error || !data || data.length === 0) return fallbackInsuranceProviders
  const seen = new Set<string>()
  const deduped = data.filter((p) => (seen.has(p.name) ? false : (seen.add(p.name), true)))
  return deduped.map((p) => ({
    id: p.id,
    name: p.name,
    tagline: p.tagline,
    monthly: p.monthly,
    bestFor: p.best_for,
    features: p.features,
    rating: p.rating,
    coverage: p.coverage,
  }))
}

export async function getDealers(): Promise<Dealer[]> {
  if (!supabase) return fallbackDealers
  const { data, error } = await supabase.from('dealers').select('*')
  if (error || !data || data.length === 0) return fallbackDealers
  return data.map((d) => ({
    id: d.id,
    name: d.name,
    city: d.city,
    province: d.province,
    brands: d.brands,
    website: d.website ?? '',
  }))
}

export async function getCars(): Promise<Car[]> {
  if (!supabase) return fallbackCars
  const { data, error } = await supabase.from('cars').select('*')
  if (error || !data || data.length === 0) return fallbackCars
  return data.map((c) => ({
    id: c.id,
    title: c.title,
    brand: c.brand,
    year: c.year,
    mileage: c.mileage,
    price: c.price,
    marketValue: c.market_value,
    fuel: c.fuel,
    transmission: c.transmission,
    dealerId: c.dealer_id,
    image: c.image,
    listingUrl: c.listing_url ?? undefined,
  }))
}

// Choosing a car is the real trigger that moves the buyer journey forward —
// it marks the "Find Your Car" stage (4 of 6) as done for this user. journey
// progress is stored as a 0-100 number on the profile; deriveStageStatuses()
// (lib/data.ts) turns that into per-stage completed/current/locked state.
export async function selectCar(profileId: string, carId: string) {
  if (!supabase) return false
  const FIND_CAR_STAGE_PROGRESS = Math.ceil((4 / 6) * 100) // 67%
  const { data: profile } = await supabase
    .from('profiles')
    .select('journey_progress')
    .eq('id', profileId)
    .maybeSingle()
  const newProgress = Math.max(profile?.journey_progress ?? 0, FIND_CAR_STAGE_PROGRESS)
  const { error } = await supabase
    .from('profiles')
    .update({ selected_car_id: carId, journey_progress: newProgress })
    .eq('id', profileId)
  return !error
}

export async function clearSelectedCar(profileId: string) {
  if (!supabase) return false
  const { error } = await supabase
    .from('profiles')
    .update({ selected_car_id: null })
    .eq('id', profileId)
  return !error
}

export async function getDocuments(profileId: string): Promise<DocItem[]> {
  if (!supabase) return []
  const { data } = await supabase.from('documents').select('*').eq('profile_id', profileId)
  if (!data) return []
  return data.map((d) => ({
    id: d.id,
    name: d.name,
    type: d.type,
    status: d.status,
    expiry: d.expiry ?? undefined,
    note: d.note ?? undefined,
  }))
}

export async function addDocument(
  profileId: string,
  doc: { name: string; type: string; status: DocItem['status']; note?: string },
) {
  if (!supabase) return null
  const id = crypto.randomUUID()
  const { data, error } = await supabase
    .from('documents')
    .insert({ id, profile_id: profileId, name: doc.name, type: doc.type, status: doc.status, note: doc.note })
    .select()
    .single()
  if (error) return null
  return { id: data.id, name: data.name, type: data.type, status: data.status, note: data.note ?? undefined } as DocItem
}

export async function updateDocumentStatus(id: string, status: DocItem['status'], note?: string) {
  if (!supabase) return
  await supabase.from('documents').update({ status, note }).eq('id', id)
}

export async function getQuotation(profileId: string): Promise<Quotation | null> {
  if (!supabase) return null
  const { data } = await supabase
    .from('quotations')
    .select('*')
    .eq('profile_id', profileId)
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!data) return null
  return {
    vehicle: data.vehicle,
    vehiclePrice: data.vehicle_price,
    deposit: data.deposit,
    termMonths: data.term_months,
    interestRate: data.interest_rate,
    balloonPct: data.balloon_pct,
    fees: data.fees,
    redFlags: data.red_flags,
  }
}

export async function addQuotation(profileId: string, quotation: Quotation) {
  if (!supabase) return false
  const { error } = await supabase.from('quotations').insert({
    profile_id: profileId,
    vehicle: quotation.vehicle,
    vehicle_price: quotation.vehiclePrice,
    deposit: quotation.deposit,
    term_months: quotation.termMonths,
    interest_rate: quotation.interestRate,
    balloon_pct: quotation.balloonPct,
    fees: quotation.fees,
    red_flags: quotation.redFlags,
  })
  return !error
}

// Analytics — feeds the hidden admin stats page only. Both writes are
// scoped to the caller's own row by RLS (auth.uid() = user_id), so a
// regular user can never read or write another user's events.

export async function logLoginEvent(userId: string) {
  if (!supabase) return
  await supabase.from('login_events').insert({ user_id: userId })
}

export async function pingSession(sessionId: string, userId: string) {
  if (!supabase) return
  await supabase
    .from('sessions')
    .upsert({ session_id: sessionId, user_id: userId, last_seen_at: new Date().toISOString() }, { onConflict: 'session_id' })
}
