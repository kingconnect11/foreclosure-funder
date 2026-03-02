import {
  getCurrentUser,
  getDealRoomInvestors,
  getDealRoomActivity,
  getInvestorPipelineSummary,
} from '@/lib/queries'
import { redirect } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { GroupNotesEditor } from '@/components/group-notes-editor'

function labelStage(stage: string | null): string {
  if (!stage) return 'Unknown stage'
  return stage.replaceAll('_', ' ')
}

export default async function AdminPage() {
  const user = await getCurrentUser()
  if (!user || user.role === 'investor') redirect('/dashboard')
  if (!user.deal_room_id) redirect('/dashboard')

  const [investors, activity] = await Promise.all([
    getDealRoomInvestors(user.deal_room_id),
    getDealRoomActivity(user.deal_room_id),
  ])
  const stageSummaries = await Promise.all(
    investors.map((investor) => getInvestorPipelineSummary(investor.id))
  )

  const summaryMap = new Map(
    investors.map((investor, idx) => [investor.id, stageSummaries[idx]])
  )

  const investorStats = investors.map((investor) => {
    const investorActivity = activity.filter((row) => row.investor_id === investor.id)
    const activeDeals = investorActivity.filter((row) =>
      [
        'preparing_offer',
        'offer_submitted',
        'counter_offered',
        'offer_accepted',
        'in_closing',
      ].includes(row.stage ?? '')
    ).length
    return {
      investor,
      propertiesSaved: investorActivity.length,
      activeDeals,
      lastActive: investorActivity[0]?.updated_at,
    }
  })

  return (
    <div className="space-y-8">
      <section>
        <h1 className="mb-6 font-display text-[28px] font-bold leading-[1.2] text-text-primary">
          Deal Room Admin
        </h1>
        <div className="overflow-x-auto rounded-card border border-border bg-surface">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-[0.08em] text-text-muted">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Subscription</th>
                <th className="px-4 py-3">Properties Saved</th>
                <th className="px-4 py-3">Active Deals</th>
                <th className="px-4 py-3">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {investorStats.map(({ investor, propertiesSaved, activeDeals, lastActive }) => (
                <tr key={investor.id} className="border-b border-border align-top">
                  <td className="px-4 py-3 text-sm text-text-primary">
                    <details>
                      <summary className="cursor-pointer list-none font-medium">
                        {investor.full_name ?? 'Unnamed Investor'}
                      </summary>
                      <p className="mt-2 text-xs text-text-secondary">
                        {Object.entries(summaryMap.get(investor.id) ?? {})
                          .map(([stage, count]) => `${labelStage(stage)}: ${count}`)
                          .join(', ') || 'No pipeline activity yet.'}
                      </p>
                    </details>
                  </td>
                  <td className="px-4 py-3 font-data text-xs text-text-secondary">
                    {investor.email ?? '--'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-badge border border-border px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-text-secondary">
                      {investor.subscription_tier ?? 'free'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-data text-sm text-text-primary">
                    {propertiesSaved}
                  </td>
                  <td className="px-4 py-3 font-data text-sm text-text-primary">
                    {activeDeals}
                  </td>
                  <td className="px-4 py-3 text-xs text-text-secondary">
                    {lastActive
                      ? `${formatDistanceToNow(new Date(lastActive), { addSuffix: true })}`
                      : '--'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-card border border-border bg-surface p-5">
        <h2 className="mb-4 font-display text-xl text-text-primary">
          Property Activity Feed
        </h2>
        {activity.length === 0 ? (
          <p className="text-sm text-text-secondary">No recent activity.</p>
        ) : (
          <ul className="space-y-4">
            {activity.map((entry) => (
              <li key={entry.id} className="border-b border-border pb-4">
                <p className="text-sm text-text-secondary">
                  <span className="text-text-primary">
                    {entry.profiles?.full_name ?? 'Investor'}
                  </span>{' '}
                  moved{' '}
                  <span className="text-text-primary">
                    {entry.properties?.address ?? 'property'}
                  </span>{' '}
                  to <span className="text-accent">{labelStage(entry.stage)}</span>
                  {entry.offer_amount ? (
                    <>
                      {' '}
                      for{' '}
                      <span className="font-data text-text-primary">
                        ${entry.offer_amount.toLocaleString('en-US')}
                      </span>
                    </>
                  ) : null}
                </p>
                <p className="mt-1 font-data text-xs text-text-muted">
                  {entry.updated_at
                    ? formatDistanceToNow(new Date(entry.updated_at), { addSuffix: true })
                    : '--'}
                </p>
                <div className="mt-3">
                  <p className="mb-2 text-[11px] uppercase tracking-[0.08em] text-text-muted">
                    Group Notes
                  </p>
                  <GroupNotesEditor
                    pipelineId={entry.id}
                    initialValue={entry.group_notes ?? ''}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
