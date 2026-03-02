import {
  getProperties,
  getDistinctCities,
  getDashboardStats,
  getCurrentUser,
  getUserPipelinePropertyIds,
} from '@/lib/queries'
import Link from 'next/link'
import { StatCard } from '@/components/stat-card'
import { FilterBar } from '@/components/filter-bar'
import { PropertyCard } from '@/components/property-card'

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

  const currentPage = Number(params.page ?? '1')
  const safePage = Number.isFinite(currentPage) && currentPage > 0 ? currentPage : 1

  const [{ properties, total }, cities, stats, savedPropertyIds] = await Promise.all([
    getProperties({
      stage: params.stage,
      city: params.city,
      sort: params.sort,
      search: params.search,
      page: safePage,
    }),
    getDistinctCities(),
    getDashboardStats(user.id),
    getUserPipelinePropertyIds(user.id),
  ])

  const totalPages = Math.max(1, Math.ceil(total / 30))
  const savedSet = new Set(savedPropertyIds)

  const buildPageHref = (page: number) => {
    const query = new URLSearchParams()
    if (params.stage) query.set('stage', params.stage)
    if (params.city) query.set('city', params.city)
    if (params.sort) query.set('sort', params.sort)
    if (params.search) query.set('search', params.search)
    query.set('page', String(page))
    return `/dashboard?${query.toString()}`
  }

  return (
    <div className="space-y-12">
      <section>
        <h1 className="mb-6 font-display text-[28px] font-bold leading-[1.2] text-text-primary">
          Market Dashboard
        </h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Active" value={stats.totalActive} />
          <StatCard label="Auction Scheduled" value={stats.auctionScheduled} />
          <StatCard label="New This Week" value={stats.newThisWeek} />
          <StatCard label="In Your Pipeline" value={stats.inPipeline} />
        </div>
      </section>

      <section className="space-y-4">
        <FilterBar cities={cities} />
        <p className="text-sm text-text-secondary">
          Showing <span className="font-data text-text-primary">{properties.length}</span> of{' '}
          <span className="font-data text-text-primary">{total}</span> active properties
        </p>
      </section>

      <section className="space-y-4">
        {properties.length === 0 ? (
          <p className="rounded-card border border-border bg-surface p-6 text-sm text-text-secondary">
            No properties match these filters.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                initiallySaved={savedSet.has(property.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="flex items-center justify-between border-t border-border pt-4">
        <Link
          href={buildPageHref(Math.max(1, safePage - 1))}
          className={`rounded-card border border-border px-4 py-2 text-xs uppercase tracking-[0.08em] ${
            safePage <= 1
              ? 'pointer-events-none opacity-40'
              : 'text-text-secondary hover:border-text-secondary hover:text-text-primary'
          }`}
        >
          Previous
        </Link>
        <p className="font-data text-sm text-text-secondary">
          Page {safePage} of {totalPages}
        </p>
        <Link
          href={buildPageHref(Math.min(totalPages, safePage + 1))}
          className={`rounded-card border border-border px-4 py-2 text-xs uppercase tracking-[0.08em] ${
            safePage >= totalPages
              ? 'pointer-events-none opacity-40'
              : 'text-text-secondary hover:border-text-secondary hover:text-text-primary'
          }`}
        >
          Next
        </Link>
      </section>
    </div>
  )
}
