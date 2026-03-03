import { getCurrentUser, getDashboardStats, getDealRoom } from '@/lib/queries'
import { redirect } from 'next/navigation'
import Nav from '@/components/nav'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const [stats, dealRoom] = await Promise.all([
    getDashboardStats(user.id),
    user.deal_room_id ? getDealRoom(user.deal_room_id) : Promise.resolve(null),
  ])

  return (
    <div className="min-h-screen bg-background">
      <Nav user={user} stats={stats} dealRoom={dealRoom} />
      <main className="lg:ml-[280px] min-h-screen pt-16 lg:pt-0">
        <div className="max-w-[1400px] mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
