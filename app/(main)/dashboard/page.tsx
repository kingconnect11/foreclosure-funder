import {
  getProperties,
  getDistinctCities,
  getDashboardStats,
  getCurrentUser,
  getUserPipeline
} from '@/lib/queries'
import { Suspense } from 'react'
import { StatCard } from '@/components/stat-card'
import { FilterBar } from '@/components/filter-bar'
import { PropertyCard } from '@/components/property-card'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, SearchX } from 'lucide-react'

function FilterBarSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <div className="bg-surface border border-border rounded h-[38px] w-[160px] animate-pulse" />
      <div className="bg-surface border border-border rounded h-[38px] w-[160px] animate-pulse" />
      <div className="bg-surface border border-border rounded h-[38px] w-[160px] animate-pulse" />
      <div className="bg-surface border border-border rounded h-[38px] flex-1 animate-pulse" />
    </div>
  )
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    stage?: string
    city?: string
    sort?: string
    search?: string
    page?: string
  }>
}) {
  const params = await searchParams
  const user = await getCurrentUser()
  if (!user) return null

  const [{ properties, total }, cities, stats, pipeline] = await Promise.all([
    getProperties({
      stage: params.stage,
      city: params.city,
      sort: params.sort,
      search: params.search,
      page: params.page ? parseInt(params.page) : 1,
    }),
    getDistinctCities(),
    getDashboardStats(user.id),
    getUserPipeline(user.id)
  ])

  const savedPropertyIds = new Set(pipeline.map(p => p.property_id))

  const totalPages = Math.ceil(total / 30)
  const currentPage = params.page ? parseInt(params.page) : 1
  const hasActiveFilters = Boolean(
    params.stage || params.city || params.sort || params.search
  )

  const getPageUrl = (page: number) => {
    const p = new URLSearchParams()
    if (params.stage) p.set('stage', params.stage)
    if (params.city) p.set('city', params.city)
    if (params.sort) p.set('sort', params.sort)
    if (params.search) p.set('search', params.search)
    if (page > 1) p.set('page', page.toString())
    return `/dashboard?${p.toString()}`
  }

  return (
    <div>
      <h1 className="font-display font-bold text-[28px] mb-8 text-text-primary">
        {user.full_name ? `Welcome back, ${user.full_name.split(' ')[0]}` : 'Dashboard'}
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <StatCard label="Total Active" value={stats.totalActive} />
        <StatCard label="Auction Scheduled" value={stats.auctionScheduled} />
        <StatCard label="New This Week" value={stats.newThisWeek} />
        <StatCard label="In Your Pipeline" value={stats.inPipeline} />
      </div>

      <Suspense fallback={<FilterBarSkeleton />}>
        <FilterBar cities={cities} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {properties.map(property => (
          <PropertyCard 
            key={property.id} 
            property={property} 
            isSavedInitial={savedPropertyIds.has(property.id)} 
          />
        ))}
      </div>

      {properties.length === 0 && (
        <div className="zen-card py-12 px-6 text-center flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-rice-100 flex items-center justify-center">
            <SearchX className="w-6 h-6 text-ink-500" />
          </div>
          <p className="text-text-muted">
            No properties found matching your filters.
          </p>
          {hasActiveFilters && (
            <Link href="/dashboard" className="btn-secondary text-sm">
              Clear Filters
            </Link>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 sm:gap-4 py-8">
          {currentPage > 1 ? (
            <Link 
              href={getPageUrl(currentPage - 1)}
              className="px-3 sm:px-4 py-2 min-h-[44px] border border-border text-text-secondary hover:text-text-primary rounded text-sm inline-flex items-center justify-center gap-1.5 min-w-[44px]"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </Link>
          ) : (
            <div
              className="px-3 sm:px-4 py-2 min-h-[44px] border border-border text-border rounded text-sm cursor-not-allowed inline-flex items-center justify-center gap-1.5 min-w-[44px]"
              aria-hidden="true"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </div>
          )}
          
          <span className="hidden sm:inline text-sm text-text-secondary">
            Page {currentPage} of {totalPages}
          </span>
          
          {currentPage < totalPages ? (
            <Link 
              href={getPageUrl(currentPage + 1)}
              className="px-3 sm:px-4 py-2 min-h-[44px] border border-border text-text-secondary hover:text-text-primary rounded text-sm inline-flex items-center justify-center gap-1.5 min-w-[44px]"
              aria-label="Next page"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <div
              className="px-3 sm:px-4 py-2 min-h-[44px] border border-border text-border rounded text-sm cursor-not-allowed inline-flex items-center justify-center gap-1.5 min-w-[44px]"
              aria-hidden="true"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
