import { signIn } from '@/actions/auth'
import Link from 'next/link'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-[400px] bg-surface border border-border rounded p-8">
        <h1 className="font-display font-bold text-[28px] mb-6 text-center text-text-primary">
          Sign In
        </h1>
        {params.error && (
          <div className="mb-6 p-3 bg-danger/10 border border-danger text-danger text-sm rounded">
            {params.error}
          </div>
        )}
        <form action={signIn} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="block text-[12px] font-medium uppercase tracking-[0.05em] text-text-secondary">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full min-h-[44px] bg-background border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="block text-[12px] font-medium uppercase tracking-[0.05em] text-text-secondary">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full min-h-[44px] bg-background border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            className="w-full min-h-[44px] bg-accent hover:bg-accent-hover text-[#0B1928] font-semibold text-sm rounded py-2.5 transition-colors mt-2"
          >
            Sign In
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-text-secondary">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="inline-flex min-h-[44px] items-center px-2 -mx-2 text-accent hover:text-accent-hover transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
