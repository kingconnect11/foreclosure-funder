import {
  getCurrentUser,
  getDealRoomInvestors,
  getDealRoomActivity,
  getInvestorPipelineSummary,
} from '@/lib/queries'
import { redirect } from 'next/navigation'
import { InvestorTable } from '@/components/investor-table'
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
  const summaryPromises = investors.map(inv => 
    getInvestorPipelineSummary(inv.id).then(summary => ({ id: inv.id, summary }))
  )
  const summariesArray = await Promise.all(summaryPromises)
  const summariesMap = Object.fromEntries(summariesArray.map(s => [s.id, s.summary]))

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Deal Room Admin</h1>
        <p className="text-muted">Manage your investors and track pipeline activity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-serif font-semibold mb-4 text-foreground flex items-center gap-2">
              Investors <span className="bg-surface-2 text-muted text-xs px-2 py-0.5 rounded-full font-sans">{investors.length}</span>
            </h2>
            <InvestorTable investors={investors} summaries={summariesMap} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <ActivityFeed activities={activity} />
        </div>
      </div>
    </div>
  )
}
