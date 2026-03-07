'use client'

import Link from 'next/link'
import { useState } from 'react'
import { signUp } from '@/actions/auth'

interface SignupFormProps {
  error?: string
}

export function SignupForm({ error }: SignupFormProps) {
  const [clientError, setClientError] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget
    const formData = new FormData(form)
    const password = (formData.get('password') as string) ?? ''
    const confirmPassword = (formData.get('confirm_password') as string) ?? ''

    if (password !== confirmPassword) {
      event.preventDefault()
      setClientError('Passwords do not match')
      return
    }

    setClientError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-[400px] bg-surface border border-border rounded p-8">
        <h1 className="font-display font-bold text-[28px] mb-6 text-center text-text-primary">
          Create Account
        </h1>

        {(error || clientError) && (
          <div className="mb-6 p-3 bg-danger/10 border border-danger text-danger text-sm rounded">
            {clientError || error}
          </div>
        )}

        <form action={signUp} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="full_name" className="block text-[12px] font-medium uppercase tracking-[0.05em] text-text-secondary">
              Full Name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              autoComplete="name"
              required
              className="w-full min-h-[44px] bg-background border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
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
              autoComplete="new-password"
              required
              className="w-full min-h-[44px] bg-background border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="confirm_password" className="block text-[12px] font-medium uppercase tracking-[0.05em] text-text-secondary">
              Confirm Password
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              autoComplete="new-password"
              required
              className="w-full min-h-[44px] bg-background border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            className="w-full min-h-[44px] bg-accent hover:bg-accent-hover text-[#0B1928] font-semibold text-sm rounded py-2.5 transition-colors mt-2"
          >
            Create account
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link
            href="/login"
            className="inline-flex min-h-[44px] items-center px-2 -mx-2 text-accent hover:text-accent-hover transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
