import { signIn } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <>
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Sign In</h1>
        <p className="mt-2 text-sm text-muted">Welcome back to Foreclosure Funder</p>
      </div>

      {error && (
        <div className="rounded-sharp bg-danger/10 p-3 text-sm text-red-400 border border-danger/20">
          {error}
        </div>
      )}

      <form action={signIn} className="mt-8 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <Input id="email" name="email" type="email" required placeholder="name@example.com" />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <Input id="password" name="password" type="password" required />
          </div>
        </div>
        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-accent-pine hover:text-accent-pine-light hover:underline">
          Sign up
        </Link>
      </p>
    </>
  )
}
