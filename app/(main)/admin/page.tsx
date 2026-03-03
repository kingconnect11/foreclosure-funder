import {
  getCurrentUser,
  getDealRoomInvestors,
  getDealRoomActivity,
  getInvestorPipelineSummary
} from '@/lib/queries'
import { redirect } from 'next/navigation'
import { AdminInvestorTable } from '@/components/admin-investor-table'
import { ActivityFeed } from '@/components/activity-feed'

export default async function AdminPage() {
  const user = await getCurrentUser()
  if (!user || user.role === 'investor') redirect('/dashboard')
  if (!user.deal_room_id) redirect('/dashboard')

  const [investors, activity] = await Promise.all([
    getDealRoomInvestors(user.deal_room_id),
    getDealRoomActivity(user.deal_room_id),
  ])

  // Fetch summaries for all investors
  const summaries = await Promise.all(
    investors.map(inv => getInvestorPipelineSummary(inv.id))
  )

  const investorsWithSummary = investors.map((inv, idx) => ({
    ...inv,
    summary: summaries[idx]
  }))

  return (
    <div className="flex flex-col gap-12 pb-12">
      <div className="flex items-baseline justify-between ledger-divider pb-4">
        <h1 className="font-display text-4xl text-text-primary">Admin Panel</h1>
        <span className="font-data text-xs text-text-muted uppercase tracking-widest hidden sm:inline-block">Command & Control</span>
      </div>

      <section className="flex flex-col gap-6">
        <div className="flex items-baseline justify-between ledger-divider pb-2">
          <h2 className="font-display text-3xl text-text-primary">Investors</h2>
        </div>
        <AdminInvestorTable investors={investorsWithSummary} />
      </section>

      <section className="flex flex-col gap-6 mt-4">
        <div className="flex items-baseline justify-between ledger-divider pb-2">
          <h2 className="font-display text-3xl text-text-primary">Recent Activity</h2>
          <span className="font-data text-xs text-text-muted uppercase tracking-widest">Global Log</span>
        </div>
        <ActivityFeed activity={activity} />
      </section>
    </div>
  )
}
