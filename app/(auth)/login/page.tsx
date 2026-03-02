import { signIn } from '@/actions/auth'
import Link from 'next/link'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-[400px] relative z-10">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl text-accent mb-2 tracking-wide">Foreclosure Funder</h1>
          <p className="text-text-secondary">Welcome back. Please enter your details.</p>
        </div>
        
        <div className="card shadow-glow">
          <h2 className="font-display font-bold text-[24px] mb-6 text-text-primary">
            Sign In
          </h2>
          {params.error && (
            <div className="mb-6 p-3 bg-danger/10 border border-danger/50 text-danger text-sm rounded">
              {params.error}
            </div>
          )}
          <form action={signIn} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="label-text">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field"
                placeholder="investor@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="label-text">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-full mt-2"
            >
              Sign In
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-text-secondary">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-accent hover:text-accent-hover transition-colors font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}