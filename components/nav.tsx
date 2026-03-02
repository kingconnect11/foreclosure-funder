'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { signOut } from '@/actions/auth'
import type { Profile } from '@/lib/types'
import clsx from 'clsx'

interface NavProps {
  user: Profile
}

export function Nav({ user }: NavProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const links = useMemo(
    () =>
      [
        { href: '/dashboard', label: 'Dashboard', show: true },
        { href: '/pipeline', label: 'Pipeline', show: true },
        {
          href: '/admin',
          label: 'Admin',
          show: user.role === 'admin' || user.role === 'super_admin',
        },
      ].filter((link) => link.show),
    [user.role]
  )

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-page items-center justify-between px-6">
        <Link
          href="/dashboard"
          className="font-display text-xl font-bold tracking-wide text-accent"
        >
          Foreclosure Funder
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'text-sm font-medium uppercase tracking-[0.08em] transition-colors',
                pathname.startsWith(link.href)
                  ? 'text-accent'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <span className="font-data text-xs text-text-muted">{user.email}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm uppercase tracking-[0.08em] text-text-secondary transition-colors hover:text-text-primary"
            >
              Sign out
            </button>
          </form>
        </div>

        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-card border border-border text-text-secondary transition hover:border-text-secondary hover:text-text-primary md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          {open ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-surface md:hidden">
          <div className="mx-auto flex w-full max-w-page flex-col gap-1 px-6 py-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'rounded-card px-3 py-2 text-sm uppercase tracking-[0.08em]',
                  pathname.startsWith(link.href)
                    ? 'bg-surface-elevated text-accent'
                    : 'text-text-secondary'
                )}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-border pt-3">
              <p className="mb-2 font-data text-xs text-text-muted">{user.email}</p>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-card border border-border px-3 py-2 text-xs uppercase tracking-[0.08em] text-text-secondary"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
