import {
  getCurrentUser,
  getDealRoomInvestors,
  getDealRoomActivity,
} from '@/lib/queries'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const user = await getCurrentUser()
  if (!user || user.role === 'investor') redirect('/dashboard')
  if (!user.deal_room_id) redirect('/dashboard')

  const [investors, activity] = await Promise.all([
    getDealRoomInvestors(user.deal_room_id),
    getDealRoomActivity(user.deal_room_id),
  ])

  // Frontend teams: replace this JSON dump with investor table + activity feed
  // Data available: investors, activity, user
  return (
    <div style={{ padding: 24, fontFamily: 'monospace' }}>
      <h1>Admin Panel (skeleton)</h1>
      <h2>Investors ({investors.length})</h2>
      <pre>{JSON.stringify(investors, null, 2)}</pre>
      <h2>Recent Activity ({activity.length})</h2>
      <pre>{JSON.stringify(activity.slice(0, 10), null, 2)}</pre>
    </div>
  )
}
