import { getCurrentUser } from '@/lib/queries'
import { redirect } from 'next/navigation'
import { Nav } from '@/components/nav'
import { Header } from '@/components/header'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-background">
      <Nav user={user} />
      <div className="flex flex-1 flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
