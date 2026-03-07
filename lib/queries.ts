import { createClient } from '@/lib/supabase/server'
import type {
  Property,
  Profile,
  InvestorPipeline,
  InvestorPreferences,
  CourtResearch,
  DealRoom,
  PropertyStage,
  PipelineStage,
  PipelineStageHistory,
} from '@/lib/types'
import { calculateOwnedAnalytics } from '@/lib/owned/calculations'
import type {
  OwnedAnalytics,
  OwnedChartId,
  OwnedPropertyWithCosts,
  OwnedPropertyStatus,
} from '@/lib/owned/types'

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
  const supabaseAny = supabase as unknown as {
    from: (table: string) => {
      select: (
        columns: string,
        options?: { count?: 'exact'; head?: boolean }
      ) => {
        eq: (column: string, value: string) => {
          is: (column: string, value: null) => Promise<{ count: number | null; error: Error | null }>
        }
      }
    }
  }

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
    supabaseAny
      .from('investor_pipeline')
      .select('*', { count: 'exact', head: true })
      .eq('investor_id', userId)
      .is('moved_to_owned_at', null),
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
  const supabaseAny = supabase as unknown as {
    from: (table: string) => {
      select: (columns: string) => {
        eq: (column: string, value: string) => {
          is: (column: string, value: null) => {
            order: (
              column: string,
              options: { ascending: boolean }
            ) => Promise<{ data: unknown; error: Error | null }>
          }
        }
      }
    }
  }

  const { data, error } = await supabaseAny
    .from('investor_pipeline')
    .select('*, properties(*)')
    .eq('investor_id', userId)
    .is('moved_to_owned_at', null)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as PipelineEntryWithProperty[]
}

// ---------------------------------------------------------------------------
// Owned Properties
// ---------------------------------------------------------------------------

export async function getOwnedProperties(
  investorId: string,
  filters: Pick<OwnedPropertyFilters, 'status' | 'search'> = {}
): Promise<OwnedPropertyWithCosts[]> {
  const supabase = await createClient()
  const supabaseAny = supabase as unknown as {
    from: (table: string) => any
  }

  let query = supabaseAny
    .from('owned_properties')
    .select('*, owned_property_cost_items(*)')
    .eq('investor_id', investorId)

  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  if (filters.search) {
    query = query.or(`address.ilike.%${filters.search}%,city.ilike.%${filters.search}%`)
  }

  const { data, error } = await query
    .order('acquired_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as OwnedPropertyWithCosts[]
}

export interface OwnedPropertyFilters {
  status?: OwnedPropertyStatus
  search?: string
  page?: number
  pageSize?: number
}

export async function getOwnedPropertiesPage(
  investorId: string,
  filters: OwnedPropertyFilters = {}
): Promise<{ properties: OwnedPropertyWithCosts[]; total: number; page: number; pageSize: number }> {
  const supabase = await createClient()
  const supabaseAny = supabase as unknown as {
    from: (table: string) => any
  }
  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 12
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabaseAny
    .from('owned_properties')
    .select('*, owned_property_cost_items(*)', { count: 'exact' })
    .eq('investor_id', investorId)

  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  if (filters.search) {
    query = query.or(`address.ilike.%${filters.search}%,city.ilike.%${filters.search}%`)
  }

  const { data, error, count } = await query
    .order('acquired_at', { ascending: false })
    .range(from, to)

  if (error) throw error

  return {
    properties: (data ?? []) as OwnedPropertyWithCosts[],
    total: count ?? 0,
    page,
    pageSize,
  }
}

export async function getOwnedAnalytics(
  investorId: string,
  filters: Pick<OwnedPropertyFilters, 'status' | 'search'> = {}
): Promise<OwnedAnalytics> {
  const properties = await getOwnedProperties(investorId, filters)
  return calculateOwnedAnalytics(properties)
}

export async function getOwnedChartPreferences(userId: string): Promise<OwnedChartId[]> {
  const supabase = await createClient()
  const supabaseAny = supabase as unknown as {
    from: (table: string) => {
      select: (columns: string) => {
        eq: (column: string, value: string) => {
          maybeSingle: () => Promise<{ data: { pinned_chart_ids: string[] | null } | null; error: Error | null }>
        }
      }
    }
  }

  const { data, error } = await supabaseAny
    .from('owned_chart_preferences')
    .select('pinned_chart_ids')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error

  const valid: OwnedChartId[] = ['value_vs_cost', 'cost_category_mix', 'pl_breakdown']
  return (data?.pinned_chart_ids ?? []).filter((id): id is OwnedChartId =>
    valid.includes(id as OwnedChartId)
  )
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

export async function getDealRoomMembers(
  dealRoomId: string
): Promise<Profile[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('deal_room_id', dealRoomId)
    .order('full_name', { ascending: true })

  if (error) throw error
  return data ?? []
}

export interface DealRoomActivityEntry {
  id: string
  activity_type: 'pipeline' | 'portfolio'
  stage: string | null
  offer_amount: number | null
  updated_at: string | null
  profiles: { full_name: string | null } | null
  properties: { address: string | null; city: string | null } | null
}

export async function getDealRoomActivity(
  dealRoomId: string
): Promise<DealRoomActivityEntry[]> {
  const supabase = await createClient()
  const supabaseAny = supabase as unknown as {
    from: (table: string) => any
  }

  const { data: members, error: membersError } = await supabase
    .from('profiles')
    .select('id')
    .eq('deal_room_id', dealRoomId)

  if (membersError) throw membersError

  const memberIds = (members ?? []).map((member) => member.id)
  if (memberIds.length === 0) return []

  const { data: pipelineData, error: pipelineError } = await supabase
    .from('investor_pipeline')
    .select(
      '*, profiles!investor_pipeline_investor_id_fkey(full_name), properties(address, city)'
    )
    .in('investor_id', memberIds)
    .order('updated_at', { ascending: false })
    .limit(50)

  if (pipelineError) throw pipelineError

  const { data: portfolioData, error: portfolioError } = await supabaseAny
    .from('owned_properties')
    .select(
      'id, address, city, updated_at, acquired_at, created_at, profiles!owned_properties_investor_id_fkey(full_name)'
    )
    .in('investor_id', memberIds)
    .order('updated_at', { ascending: false })
    .limit(50)

  if (portfolioError) throw portfolioError

  const pipelineEntries = (pipelineData ?? []).map((row: any) => ({
    id: row.id,
    activity_type: 'pipeline' as const,
    stage: row.stage ?? null,
    offer_amount: row.offer_amount ?? null,
    updated_at: row.updated_at ?? null,
    profiles: row.profiles
      ? { full_name: row.profiles.full_name ?? null }
      : { full_name: null },
    properties: row.properties
      ? {
          address: row.properties.address ?? null,
          city: row.properties.city ?? null,
        }
      : { address: null, city: null },
  }))

  const portfolioEntries = (portfolioData ?? []).map((row: any) => ({
    id: `portfolio-${row.id}`,
    activity_type: 'portfolio' as const,
    stage: 'portfolio_added',
    offer_amount: null,
    updated_at: row.updated_at ?? row.acquired_at ?? row.created_at ?? null,
    profiles: row.profiles
      ? { full_name: row.profiles.full_name ?? null }
      : { full_name: null },
    properties: {
      address: row.address ?? null,
      city: row.city ?? null,
    },
  }))

  return [...pipelineEntries, ...portfolioEntries]
    .sort((a, b) => {
      const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0
      const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0
      return bTime - aTime
    })
    .slice(0, 50)
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

export async function getInvestorPortfolioCount(investorId: string): Promise<number> {
  const supabase = await createClient()
  const supabaseAny = supabase as unknown as {
    from: (table: string) => any
  }

  const { count, error } = await supabaseAny
    .from('owned_properties')
    .select('id', { count: 'exact', head: true })
    .eq('investor_id', investorId)

  if (error) throw error
  return count ?? 0
}

// ---------------------------------------------------------------------------
// Pipeline Stage History
// ---------------------------------------------------------------------------

export async function getStageHistory(pipelineId: string): Promise<PipelineStageHistory[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pipeline_stage_history')
    .select('*')
    .eq('pipeline_id', pipelineId)
    .order('entered_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

// ---------------------------------------------------------------------------
// Onboarding
// ---------------------------------------------------------------------------

export async function getInvestorPreferences(
  investorId: string
): Promise<InvestorPreferences | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('investor_preferences')
    .select('*')
    .eq('investor_id', investorId)
    .maybeSingle()

  if (error) throw error
  return data
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
