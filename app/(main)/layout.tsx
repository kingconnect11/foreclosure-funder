import { getCurrentUser } from '@/lib/queries'
import { redirect } from 'next/navigation'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  // Frontend teams: add <Nav user={user} /> here
  return <>{children}</>
}
