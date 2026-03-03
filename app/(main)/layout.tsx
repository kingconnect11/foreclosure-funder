import { getCurrentUser } from '@/lib/queries'
import { redirect } from 'next/navigation'
import Nav from '@/components/nav'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Nav user={user} />
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}