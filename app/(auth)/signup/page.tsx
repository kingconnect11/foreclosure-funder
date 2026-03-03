import { signUp } from '@/actions/auth'
import Link from 'next/link'

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      <div className="w-full max-w-[440px] relative z-10">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-accent mb-2">Foreclosure Funder</h1>
          <p className="font-data text-xs text-text-secondary uppercase tracking-widest">New Entity Registration</p>
        </div>
        
        <div className="dossier-card p-8">
          <div className="ledger-divider pb-4 mb-6">
            <h2 className="font-display text-2xl text-text-primary">
              Create Dossier
            </h2>
          </div>
          
          {params.error && (
            <div className="mb-6 p-3 bg-danger/10 border border-danger/30 text-danger text-sm rounded-sm font-data">
              {params.error}
            </div>
          )}
          
          <form action={signUp} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="full_name" className="label-text">
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                className="input-field"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="label-text">
                Email Address
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="password" className="label-text">
                  Passphrase
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
              <div className="space-y-2">
                <label htmlFor="confirm_password" className="label-text">
                  Confirm
                </label>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  required
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="pt-4">
              <button
                type="submit"
                className="btn-primary w-full"
              >
                Initialize Registration
              </button>
            </div>
          </form>
          
          <div className="mt-8 pt-6 ledger-divider text-center">
            <p className="text-sm text-text-secondary">
              Already registered?{' '}
              <Link href="/login" className="text-accent hover:text-accent-hover transition-colors font-medium">
                Access Ledger
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
