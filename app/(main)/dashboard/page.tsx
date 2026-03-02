import {
  getProperties,
  getDistinctCities,
  getDashboardStats,
  getCurrentUser,
} from '@/lib/queries'

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

  const [{ properties, total }, cities, stats] = await Promise.all([
    getProperties({
      stage: params.stage,
      city: params.city,
      sort: params.sort,
      search: params.search,
      page: params.page ? parseInt(params.page) : 0,
    }),
    getDistinctCities(),
    getDashboardStats(user.id),
  ])

  const totalPages = Math.ceil(total / 30)
  const currentPage = params.page ? parseInt(params.page) : 0

  // Frontend teams: replace this JSON dump with UI components
  // Data available: stats, properties, total, totalPages, currentPage, cities, user
  return (
    <div style={{ padding: 24, fontFamily: 'monospace' }}>
      <h1>Dashboard (skeleton)</h1>
      <h2>Stats</h2>
      <pre>{JSON.stringify(stats, null, 2)}</pre>
      <h2>Filters</h2>
      <pre>
        {JSON.stringify(
          { stage: params.stage, city: params.city, sort: params.sort, search: params.search },
          null,
          2
        )}
      </pre>
      <p>Available cities: {cities.join(', ')}</p>
      <h2>
        Properties ({properties.length} of {total})
      </h2>
      <pre>{JSON.stringify(properties.slice(0, 3), null, 2)}</pre>
      {properties.length > 3 && <p>... and {properties.length - 3} more</p>}
      <p>
        Page {currentPage + 1} of {totalPages}
      </p>
    </div>
  )
}
