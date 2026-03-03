import {
  getProperties,
  getDistinctCities,
  getDashboardStats,
  getCurrentUser,
  getUserPipeline,
} from '@/lib/queries'
import { StatCard } from '@/components/stat-card'
import { FilterBar } from '@/components/filter-bar'
import { PropertyCard } from '@/components/property-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileQuestion, ChevronLeft, ChevronRight } from 'lucide-react'

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
    getUserPipeline(user.id),
  ])

  const savedPropertyIds = new Set(pipeline.map(p => p.property_id))

  const totalPages = Math.max(1, Math.ceil(total / 30))
  const currentPage = params.page ? parseInt(params.page) : 1

  const buildPageUrl = (page: number) => {
    const urlParams = new URLSearchParams()
    if (params.stage) urlParams.set('stage', params.stage)
    if (params.city) urlParams.set('city', params.city)
    if (params.sort) urlParams.set('sort', params.sort)
    if (params.search) urlParams.set('search', params.search)
    urlParams.set('page', page.toString())
    return `?${urlParams.toString()}`
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Active" value={stats.totalActive} />
        <StatCard label="Auction Scheduled" value={stats.auctionScheduled} />
        <StatCard label="New This Week" value={stats.newThisWeek} />
        <StatCard label="In Your Pipeline" value={stats.inPipeline} />
      </div>

      <div className="rounded-sharp border border-border bg-surface-1 p-6">
        <h2 className="text-lg font-serif font-semibold mb-4 text-foreground">Filter Properties</h2>
        <FilterBar cities={cities} />
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-serif font-semibold text-foreground">
            Properties <span className="text-muted text-sm font-sans font-normal">({total})</span>
          </h2>
        </div>

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {properties.map(property => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                isSaved={savedPropertyIds.has(property.id)} 
              />
            ))}
          </div>
        ) : (
          <div className="rounded-sharp border border-dashed border-border p-12 text-center flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-surface-2 flex items-center justify-center mb-4">
              <FileQuestion className="h-6 w-6 text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No properties found</h3>
            <p className="text-sm text-muted max-w-sm">
              No properties match your current filters. Try adjusting your search or stage filter to see more results.
            </p>
          </div>
        )}

        {total > 0 && (
          <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
            <p className="text-sm text-muted">
              Showing page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                disabled={currentPage <= 1}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
              >
                <Link href={buildPageUrl(currentPage - 1)}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                disabled={currentPage >= totalPages}
                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
              >
                <Link href={buildPageUrl(currentPage + 1)}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
