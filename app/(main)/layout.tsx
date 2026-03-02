import { getCurrentUser } from '@/lib/queries'
import { redirect } from 'next/navigation'
import { Nav } from '@/components/nav'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return (
    <>
      <Nav user={user} />
      <main className="mx-auto w-full max-w-page px-6 pb-12 pt-24">{children}</main>
    </>
  )
}
