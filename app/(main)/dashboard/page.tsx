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
      page: params.page ? parseInt(params.page) : 0,
    }),
    getDistinctCities(),
    getDashboardStats(user.id),
    getUserPipeline(user.id)
  ])

  const savedPropertyIds = new Set(pipeline.map(p => p.property_id))

  const totalPages = Math.ceil(total / 30)
  const currentPage = params.page ? parseInt(params.page) : 0

  const getPageUrl = (page: number) => {
    const p = new URLSearchParams()
    if (params.stage) p.set('stage', params.stage)
    if (params.city) p.set('city', params.city)
    if (params.sort) p.set('sort', params.sort)
    if (params.search) p.set('search', params.search)
    if (page > 0) p.set('page', page.toString())
    return `/dashboard?${p.toString()}`
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-8 pb-4 ledger-divider">
        <h1 className="font-display text-4xl text-text-primary">Dashboard</h1>
        <span className="font-data text-xs text-text-muted uppercase tracking-widest hidden sm:inline-block">Dossier Overview</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard label="Total Active" value={stats.totalActive} />
        <StatCard label="Auction Scheduled" value={stats.auctionScheduled} />
        <StatCard label="New This Week" value={stats.newThisWeek} />
        <StatCard label="In Your Pipeline" value={stats.inPipeline} />
      </div>

      <FilterBar cities={cities} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {properties.map(property => (
          <PropertyCard 
            key={property.id} 
            property={property} 
            isSavedInitial={savedPropertyIds.has(property.id)} 
          />
        ))}
      </div>

      {properties.length === 0 && (
        <div className="dossier-card text-center py-20 flex flex-col items-center">
          <p className="font-display text-2xl text-text-muted mb-2">No Properties Found</p>
          <p className="text-sm text-text-secondary">Adjust your filters to see more results.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-8 ledger-divider">
          {currentPage > 0 ? (
            <Link 
              href={getPageUrl(currentPage - 1)}
              className="btn-secondary"
            >
              Previous
            </Link>
          ) : (
            <div className="px-6 py-2 border border-border text-border rounded-sm text-sm cursor-not-allowed">Previous</div>
          )}
          
          <span className="text-xs font-data text-text-secondary uppercase tracking-wider">
            Page {currentPage + 1} of {totalPages}
          </span>
          
          {currentPage < totalPages - 1 ? (
            <Link 
              href={getPageUrl(currentPage + 1)}
              className="btn-secondary"
            >
              Next
            </Link>
          ) : (
            <div className="px-6 py-2 border border-border text-border rounded-sm text-sm cursor-not-allowed">Next</div>
          )}
        </div>
      )}
    </div>
  )
}
