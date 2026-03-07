import {
  getCurrentUser,
  getDealRoomInvestors,
  getDealRoomActivity,
  getInvestorPipelineSummary,
  getInvestorPortfolioCount,
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
  const [summaries, portfolioCounts] = await Promise.all([
    Promise.all(investors.map(inv => getInvestorPipelineSummary(inv.id))),
    Promise.all(investors.map(inv => getInvestorPortfolioCount(inv.id))),
  ])

  const investorsWithSummary = investors.map((inv, idx) => ({
    ...inv,
    summary: summaries[idx],
    portfolioCount: portfolioCounts[idx],
  }))

  return (
    <div className="flex flex-col gap-12 pb-12">
      <div className="flex flex-col gap-6">
        <h1 className="font-display font-bold text-[28px] text-text-primary">Admin Panel</h1>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-[20px] text-text-primary">Investors</h2>
        <AdminInvestorTable investors={investorsWithSummary} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-[20px] text-text-primary">Recent Activity</h2>
        <ActivityFeed activity={activity} />
      </section>
    </div>
  )
}
