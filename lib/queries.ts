import { createClient } from '@/lib/supabase/server'
import type {
  Property,
  Profile,
  InvestorPipeline,
  CourtResearch,
  DealRoom,
  PropertyStage,
  PipelineStage,
} from '@/lib/types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 30

/** Stages excluded from the main dashboard listing */
const EXCLUDED_STAGES: PropertyStage[] = ['sold', 'redeemed', 'canceled']

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export interface PropertyFilters {
  stage?: string
  city?: string
  sort?: string
  search?: string
  page?: number
}

export async function getProperties(
  filters: PropertyFilters = {}
): Promise<{ properties: Property[]; total: number }> {
  const supabase = await createClient()
  const { stage, city, sort = 'newest', search, page = 1 } = filters

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .not('stage', 'in', `(${EXCLUDED_STAGES.join(',')})`)

  if (stage) {
    query = query.eq('stage', stage as PropertyStage)
  }

  if (city) {
    query = query.eq('city', city)
  }

  if (search) {
    query = query.or(
      `address.ilike.%${search}%,case_number.ilike.%${search}%`
    )
  }

  // Sorting
  switch (sort) {
    case 'sale_date':
      query = query.order('sale_date', { ascending: true, nullsFirst: false })
      break
    case 'value_high':
      query = query.order('county_appraisal', {
        ascending: false,
        nullsFirst: false,
      })
      break
    case 'value_low':
      query = query.order('county_appraisal', {
        ascending: true,
        nullsFirst: false,
      })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) throw error

  return {
    properties: data ?? [],
    total: count ?? 0,
  }
}

export async function getDistinctCities(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('properties')
    .select('city')
    .not('stage', 'in', `(${EXCLUDED_STAGES.join(',')})`)
    .not('city', 'is', null)
    .order('city', { ascending: true })

  if (error) throw error

  // Deduplicate and filter nulls
  const cities = [...new Set((data ?? []).map((r) => r.city).filter(Boolean))] as string[]
  return cities
}

export interface DashboardStats {
  totalActive: number
  auctionScheduled: number
  newThisWeek: number
  inPipeline: number
}

export async function getDashboardStats(
  userId: string
): Promise<DashboardStats> {
  const supabase = await createClient()

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const sevenDaysAgoISO = sevenDaysAgo.toISOString()

  // Run all four counts in parallel
  const [totalActiveRes, auctionRes, newRes, pipelineRes] = await Promise.all([
    // Total active properties (not sold/redeemed/canceled)
    supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .not('stage', 'in', `(${EXCLUDED_STAGES.join(',')})`),

    // Auction scheduled (sale_date_assigned + upcoming)
    supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .in('stage', ['sale_date_assigned', 'upcoming']),

    // New this week
    supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgoISO),

    // In pipeline for this user
    supabase
      .from('investor_pipeline')
      .select('*', { count: 'exact', head: true })
      .eq('investor_id', userId),
  ])

  if (totalActiveRes.error) throw totalActiveRes.error
  if (auctionRes.error) throw auctionRes.error
  if (newRes.error) throw newRes.error
  if (pipelineRes.error) throw pipelineRes.error

  return {
    totalActive: totalActiveRes.count ?? 0,
    auctionScheduled: auctionRes.count ?? 0,
    newThisWeek: newRes.count ?? 0,
    inPipeline: pipelineRes.count ?? 0,
  }
}

// ---------------------------------------------------------------------------
// Property Detail
// ---------------------------------------------------------------------------

export async function getProperty(id: string): Promise<Property | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getCourtResearch(
  propertyId: string
): Promise<CourtResearch | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('court_research')
    .select('*')
    .eq('property_id', propertyId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getPipelineEntry(
  userId: string,
  propertyId: string
): Promise<InvestorPipeline | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('investor_pipeline')
    .select('*')
    .eq('investor_id', userId)
    .eq('property_id', propertyId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getWatchingCount(propertyId: string): Promise<number> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_watching_count', {
    p_property_id: propertyId,
  })

  if (error) throw error
  return data ?? 0
}

export async function getDealRoom(
  dealRoomId: string
): Promise<DealRoom | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('deal_rooms')
    .select('*')
    .eq('id', dealRoomId)
    .maybeSingle()

  if (error) throw error
  return data
}

// ---------------------------------------------------------------------------
// Pipeline Page
// ---------------------------------------------------------------------------

export type PipelineEntryWithProperty = InvestorPipeline & {
  properties: Property
}

export async function getUserPipeline(
  userId: string
): Promise<PipelineEntryWithProperty[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('investor_pipeline')
    .select('*, properties(*)')
    .eq('investor_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as PipelineEntryWithProperty[]
}

// ---------------------------------------------------------------------------
// Admin Panel
// ---------------------------------------------------------------------------

export async function getDealRoomInvestors(
  dealRoomId: string
): Promise<Profile[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('deal_room_id', dealRoomId)
    .eq('role', 'investor')
    .order('full_name', { ascending: true })

  if (error) throw error
  return data ?? []
}

export type DealRoomActivityEntry = InvestorPipeline & {
  profiles: { full_name: string | null }
  properties: { address: string | null; city: string | null }
}

export async function getDealRoomActivity(
  dealRoomId: string
): Promise<DealRoomActivityEntry[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('investor_pipeline')
    .select(
      '*, profiles!investor_pipeline_investor_id_fkey(full_name), properties(address, city)'
    )
    .eq('deal_room_id', dealRoomId)
    .order('updated_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return (data ?? []) as DealRoomActivityEntry[]
}

export async function getInvestorPipelineSummary(
  investorId: string
): Promise<Record<string, number>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('investor_pipeline')
    .select('stage')
    .eq('investor_id', investorId)

  if (error) throw error

  const summary: Record<string, number> = {}
  for (const row of data ?? []) {
    const stage = row.stage ?? 'unknown'
    summary[stage] = (summary[stage] ?? 0) + 1
  }
  return summary
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function getCurrentUser(): Promise<Profile | null> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) throw error
  return data
}
