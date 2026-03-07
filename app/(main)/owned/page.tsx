import Link from 'next/link'
import { backfillClosedPipelineToOwned } from '@/actions/owned'
import { getCurrentUser, getDealRoomMembers, getOwnedAnalytics, getOwnedChartPreferences, getOwnedPropertiesPage } from '@/lib/queries'
import type { Profile } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { OwnedTab } from '@/components/owned/owned-tab'

export default async function OwnedPage({
  searchParams,
}: {
  searchParams: Promise<{ investorId?: string; status?: string; search?: string; page?: string }>
}) {
  const params = await searchParams
  const user = await getCurrentUser()
  if (!user) return null

  const isAdmin = user.role === 'admin' || user.role === 'super_admin'
  const statusFilter = params.status === 'active' || params.status === 'sold' ? params.status : undefined
  const searchFilter = params.search?.trim() || undefined
  const currentPage = params.page ? Math.max(1, parseInt(params.page, 10) || 1) : 1
  let investorOptions: Profile[] = []
  let targetInvestorId = user.id

  if (isAdmin && user.deal_room_id) {
    investorOptions = await getDealRoomMembers(user.deal_room_id)
    const optionIds = new Set(investorOptions.map((member) => member.id))

    if (params.investorId && investorOptions.some((investor) => investor.id === params.investorId)) {
      targetInvestorId = params.investorId
    } else if (optionIds.has(user.id)) {
      targetInvestorId = user.id
    } else if (investorOptions.length > 0) {
      targetInvestorId = investorOptions[0].id
    }
  }

  const [ownedPage, analytics, pinnedChartIds] = await Promise.all([
    getOwnedPropertiesPage(targetInvestorId, {
      status: statusFilter,
      search: searchFilter,
      page: currentPage,
      pageSize: 12,
    }),
    getOwnedAnalytics(targetInvestorId, {
      status: statusFilter,
      search: searchFilter,
    }),
    getOwnedChartPreferences(user.id),
  ])
  const properties = ownedPage.properties
  const totalPages = Math.max(1, Math.ceil(ownedPage.total / ownedPage.pageSize))

  const selectedInvestor =
    investorOptions.find((investor) => investor.id === targetInvestorId) ?? null

  const getPageUrl = (page: number) => {
    const q = new URLSearchParams()
    if (isAdmin) q.set('investorId', targetInvestorId)
    if (statusFilter) q.set('status', statusFilter)
    if (searchFilter) q.set('search', searchFilter)
    if (page > 1) q.set('page', String(page))
    return `/owned?${q.toString()}`
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-[28px] text-text-primary">Portfolio</h1>
          <p className="text-text-muted text-sm mt-1">
            Track portfolio performance and historical deal outcomes in one place.
          </p>
          {selectedInvestor && (
            <p className="text-xs text-text-muted mt-2">
              Viewing: <span className="font-medium text-text-secondary">{selectedInvestor.full_name || selectedInvestor.email}</span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard" className="btn-secondary text-sm">Back to Dashboard</Link>
          <Link href="/pipeline" className="btn-ghost text-sm">View Pipeline</Link>
        </div>
      </div>

      {isAdmin && investorOptions.length > 0 && (
        <form className="zen-card p-4 flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1">
            <label htmlFor="investorId" className="label-zen mb-1">
              Portfolio Owner
            </label>
            <select id="investorId" name="investorId" defaultValue={targetInvestorId} className="input-zen">
              {investorOptions.map((investor) => (
                <option key={investor.id} value={investor.id}>
                  {investor.full_name || investor.email} ({investor.role})
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-secondary">
            View Portfolio
          </button>
        </form>
      )}

      <div className="zen-card p-4 flex flex-col lg:flex-row gap-3 lg:items-end lg:justify-between">
        <form className="flex-1 grid grid-cols-1 sm:grid-cols-[180px_1fr_auto] gap-3">
          {isAdmin && <input type="hidden" name="investorId" value={targetInvestorId} />}
          <select name="status" defaultValue={statusFilter ?? ''} className="input-zen">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="sold">Sold</option>
          </select>
          <input
            name="search"
            defaultValue={searchFilter ?? ''}
            placeholder="Search by address or city"
            className="input-zen"
          />
          <button type="submit" className="btn-secondary">Apply Filters</button>
        </form>

        <form action={backfillClosedPipelineToOwned}>
          <input type="hidden" name="target_investor_id" value={targetInvestorId} />
          <button type="submit" className="btn-ghost text-sm">
            Backfill Closed to Portfolio
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="zen-card p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-text-muted">Total Profit/Loss</p>
          <p className="font-data text-[24px] mt-2 text-text-primary">{formatCurrency(analytics.summary.totalProfitLoss)}</p>
        </div>
        <div className="zen-card p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-text-muted">YTD Profit/Loss</p>
          <p className="font-data text-[24px] mt-2 text-text-primary">{formatCurrency(analytics.summary.ytdProfitLoss)}</p>
        </div>
        <div className="zen-card p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-text-muted">Total Portfolio Value</p>
          <p className="font-data text-[24px] mt-2 text-text-primary">{formatCurrency(analytics.summary.totalPortfolioValue)}</p>
        </div>
        <div className="zen-card p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-text-muted">Property Count</p>
          <p className="font-data text-[24px] mt-2 text-text-primary">{analytics.summary.propertyCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="zen-card p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-text-muted">Construction Total</p>
          <p className="font-data text-[20px] mt-2 text-text-primary">{formatCurrency(analytics.summary.totalConstructionCost)}</p>
        </div>
        <div className="zen-card p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-text-muted">Legal Fees Total</p>
          <p className="font-data text-[20px] mt-2 text-text-primary">{formatCurrency(analytics.summary.totalLegalFees)}</p>
        </div>
        <div className="zen-card p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-text-muted">Interest Paid Total</p>
          <p className="font-data text-[20px] mt-2 text-text-primary">{formatCurrency(analytics.summary.totalInterestPaid)}</p>
        </div>
      </div>

      <OwnedTab
        key={targetInvestorId}
        analytics={analytics}
        properties={properties}
        pinnedChartIds={pinnedChartIds}
        targetInvestorId={targetInvestorId}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 py-4">
          {currentPage > 1 ? (
            <Link href={getPageUrl(currentPage - 1)} className="btn-secondary text-sm">
              Previous
            </Link>
          ) : (
            <span className="btn-secondary text-sm opacity-40 cursor-not-allowed">Previous</span>
          )}
          <span className="text-sm text-text-secondary">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages ? (
            <Link href={getPageUrl(currentPage + 1)} className="btn-secondary text-sm">
              Next
            </Link>
          ) : (
            <span className="btn-secondary text-sm opacity-40 cursor-not-allowed">Next</span>
          )}
        </div>
      )}
    </div>
  )
}
