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
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[280px_1fr]">
      <Nav user={user} stats={stats} />
      <main className="page-shell lg:pl-2">
        <div className="content-grid animate-floatIn">
          {children}
        </div>
      </main>
    </div>
  )
}