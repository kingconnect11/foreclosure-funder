import { signUp } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <>
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Create Account</h1>
        <p className="mt-2 text-sm text-muted">Join Foreclosure Funder</p>
      </div>

      {error && (
        <div className="rounded-sharp bg-danger/10 p-3 text-sm text-red-400 border border-danger/20">
          {error}
        </div>
      )}

      <form action={signUp} className="mt-8 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="full_name" className="text-sm font-medium text-foreground">
              Full Name
            </label>
            <Input id="full_name" name="full_name" type="text" required placeholder="John Doe" />
          </div>
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
          <div className="space-y-2">
            <label htmlFor="confirm_password" className="text-sm font-medium text-foreground">
              Confirm Password
            </label>
            <Input id="confirm_password" name="confirm_password" type="password" required />
          </div>
        </div>
        <Button type="submit" className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-accent-pine hover:text-accent-pine-light hover:underline">
          Sign in
        </Link>
      </p>
    </>
  )
}
