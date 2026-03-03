import { getCurrentUser, getDashboardStats } from '@/lib/queries'
import { redirect } from 'next/navigation'
import Nav from '@/components/nav'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const stats = await getDashboardStats(user.id)

  return (
    <div className="min-h-screen bg-background">
      <Nav user={user} stats={stats} />
      <main className="lg:ml-[280px] min-h-screen pt-16 lg:pt-0">
        <div className="max-w-[1400px] mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
