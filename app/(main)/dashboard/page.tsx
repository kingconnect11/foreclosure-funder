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
import { Search } from 'lucide-react'
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts'

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
      <KeyboardShortcuts isAdmin={user.role === 'admin' || user.role === 'super_admin'} />
      <h1 className="font-display font-bold text-[28px] mb-8 text-text-primary">
        Welcome back, {user.full_name?.split(' ')[0] || 'Investor'}
      </h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <StatCard label="Total Active" value={stats.totalActive} />
        <StatCard label="Auction Scheduled" value={stats.auctionScheduled} />
        <StatCard label="New This Week" value={stats.newThisWeek} />
        <StatCard label="In Your Pipeline" value={stats.inPipeline} />
      </div>

      <Suspense fallback={<FilterBarSkeleton />}>
        <FilterBar cities={cities} />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {properties.map(property => (
          <PropertyCard 
            key={property.id} 
            property={property} 
            isSavedInitial={savedPropertyIds.has(property.id)} 
          />
        ))}
        {properties.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 gap-4">
            <Search className="w-10 h-10 text-text-muted" />
            <p className="text-text-secondary text-sm text-center max-w-sm">
              No properties match your current filters. Try adjusting your search or changing the stage filter.
            </p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 sm:gap-4 py-8 flex-wrap">
          {currentPage > 1 ? (
            <Link 
              href={getPageUrl(currentPage - 1)}
              className="px-4 py-2 border border-border text-text-secondary hover:text-text-primary rounded text-sm"
            >
              Previous
            </Link>
          ) : (
            <div className="px-4 py-2 border border-border text-border rounded text-sm cursor-not-allowed">Previous</div>
          )}
          
          <span className="text-sm text-text-secondary hidden sm:inline">
            Page {currentPage} of {totalPages}
          </span>
          
          {currentPage < totalPages ? (
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