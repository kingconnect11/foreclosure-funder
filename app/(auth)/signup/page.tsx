import { signUp } from '@/actions/auth'
import Link from 'next/link'

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <section className="w-full max-w-md rounded-card border border-border bg-surface p-8">
        <h1 className="mb-1 font-display text-[28px] leading-[1.2] text-text-primary">
          Create Account
        </h1>
        <p className="mb-6 text-sm text-text-secondary">
          Build your investor profile and enter the deal room.
        </p>

        {params.error && (
          <p className="mb-4 rounded-card border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {decodeURIComponent(params.error)}
          </p>
        )}

        <form action={signUp} className="space-y-4">
          <div>
            <label
              htmlFor="full_name"
              className="mb-1 block text-xs uppercase tracking-[0.08em] text-text-muted"
            >
              Full Name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              className="h-10 w-full rounded-card border border-border bg-bg px-3 text-sm text-text-primary outline-none transition focus:border-accent"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-xs uppercase tracking-[0.08em] text-text-muted"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="h-10 w-full rounded-card border border-border bg-bg px-3 text-sm text-text-primary outline-none transition focus:border-accent"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-xs uppercase tracking-[0.08em] text-text-muted"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="h-10 w-full rounded-card border border-border bg-bg px-3 text-sm text-text-primary outline-none transition focus:border-accent"
            />
          </div>
          <div>
            <label
              htmlFor="confirm_password"
              className="mb-1 block text-xs uppercase tracking-[0.08em] text-text-muted"
            >
              Confirm Password
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              required
              className="h-10 w-full rounded-card border border-border bg-bg px-3 text-sm text-text-primary outline-none transition focus:border-accent"
            />
          </div>
          <button
            type="submit"
            className="mt-2 w-full rounded-card bg-accent px-4 py-2 text-sm font-semibold text-bg transition hover:bg-accent-hover"
          >
            Create account
          </button>
        </form>

        <p className="mt-5 text-sm text-text-secondary">
          Already have an account?{' '}
          <Link href="/login" className="text-accent hover:text-accent-hover">
            Sign in
          </Link>
        </p>
      </section>
    </div>
  )
}
