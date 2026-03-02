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
      <h1 className="font-display font-bold text-[28px] mb-8 text-text-primary">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <StatCard label="Total Active" value={stats.totalActive} />
        <StatCard label="Auction Scheduled" value={stats.auctionScheduled} />
        <StatCard label="New This Week" value={stats.newThisWeek} />
        <StatCard label="In Your Pipeline" value={stats.inPipeline} />
      </div>

      <FilterBar cities={cities} />

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
        <div className="text-center text-text-muted py-12">
          No properties found matching your filters.
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-8">
          {currentPage > 0 ? (
            <Link 
              href={getPageUrl(currentPage - 1)}
              className="px-4 py-2 border border-border text-text-secondary hover:text-text-primary rounded text-sm"
            >
              Previous
            </Link>
          ) : (
            <div className="px-4 py-2 border border-border text-border rounded text-sm cursor-not-allowed">Previous</div>
          )}
          
          <span className="text-sm text-text-secondary">
            Page {currentPage + 1} of {totalPages}
          </span>
          
          {currentPage < totalPages - 1 ? (
            <Link 
              href={getPageUrl(currentPage + 1)}
              className="px-4 py-2 border border-border text-text-secondary hover:text-text-primary rounded text-sm"
            >
              Next
            </Link>
          ) : (
            <div className="px-4 py-2 border border-border text-border rounded text-sm cursor-not-allowed">Next</div>
          )}
        </div>
      )}
    </div>
  )
}