import {
  getProperties,
  getDistinctCities,
  getDashboardStats,
  getCurrentUser,
  getUserPipeline
} from '@/lib/queries'
import { StatCard } from '@/components/stat-card'
import { FilterBar } from '@/components/filter-bar'
import { PropertyCard } from '@/components/property-card'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

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
      page: params.page ? parseInt(params.page, 10) : 1,
    }),
    getDistinctCities(),
    getDashboardStats(user.id),
    getUserPipeline(user.id)
  ])

  const savedPropertyIds = new Set(pipeline.map(p => p.property_id))

  const totalPages = Math.ceil(total / 30)
  const currentPage = params.page ? parseInt(params.page, 10) : 1

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
    <section>
      <div className="flex flex-wrap items-end justify-between mb-6 gap-3">
        <div>
          <p className="kicker mb-1">Portfolio Command</p>
          <h1 className="font-display text-4xl text-text-primary">Dashboard</h1>
        </div>
        <div className="soft-panel px-4 py-3">
          <p className="kicker mb-0.5">Pipeline Signal</p>
          <p className="text-sm text-text-secondary">
            {stats.inPipeline} tracked properties, {stats.auctionScheduled} auctions coming up
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Active" value={stats.totalActive} />
        <StatCard label="Auction Scheduled" value={stats.auctionScheduled} />
        <StatCard label="New This Week" value={stats.newThisWeek} />
        <StatCard label="In Your Pipeline" value={stats.inPipeline} />
      </div>

      <FilterBar cities={cities} />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {properties.map(property => (
          <PropertyCard 
            key={property.id} 
            property={property} 
            isSavedInitial={savedPropertyIds.has(property.id)} 
          />
        ))}
      </div>

      {properties.length === 0 ? (
        <div className="dossier-card text-center py-16 px-6 flex flex-col items-center">
          <p className="font-display text-3xl text-text-primary mb-2">No matches for current filters</p>
          <p className="text-sm text-text-secondary max-w-[540px]">
            No properties match your filters. Try adjusting your search or stage filter.
          </p>
          <Link href="/dashboard" className="btn-secondary mt-4">
            Clear all filters
          </Link>
        </div>
      ) : null}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          {currentPage > 1 ? (
            <Link 
              href={getPageUrl(Math.max(1, currentPage - 1))}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Link>
          ) : (
            <div className="px-4 py-2 border border-border text-text-muted rounded-lg text-sm cursor-not-allowed">
              Previous
            </div>
          )}
          
          <span className="text-xs font-data text-text-secondary uppercase tracking-wider financial-value">
            Page {currentPage} of {totalPages}
          </span>
          
          {currentPage < totalPages ? (
            <Link 
              href={getPageUrl(currentPage + 1)}
              className="btn-secondary inline-flex items-center gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <div className="px-4 py-2 border border-border text-text-muted rounded-lg text-sm cursor-not-allowed">
              Next
            </div>
          )}
        </div>
      )}
    </section>
  )
}
