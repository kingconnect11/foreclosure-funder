'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/actions/auth'
import type { Profile } from '@/lib/types'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import clsx from 'clsx'

export default function Nav({ user }: { user: Profile }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/pipeline', label: 'Pipeline' },
    ...(user.role === 'admin' || user.role === 'super_admin'
      ? [{ href: '/admin', label: 'Admin' }]
      : []),
  ]

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/dashboard" className="font-display font-bold text-xl text-accent tracking-wide">
              Foreclosure Funder
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    'text-sm transition-colors',
                    pathname === link.href ? 'text-text-primary font-medium' : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <span className="text-sm text-text-muted">{user.email}</span>
            <button
              onClick={() => signOut()}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Sign out
            </button>
          </div>

          <button
            className="md:hidden text-text-primary"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 h-full bg-surface border-l border-border p-6 flex flex-col shadow-2xl">
            <button
              className="absolute top-5 right-6 text-text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={24} />
            </button>
            <div className="mt-12 flex flex-col gap-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    'text-lg transition-colors',
                    pathname === link.href ? 'text-accent font-medium' : 'text-text-primary hover:text-accent'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-border my-2" />
              <div className="flex flex-col gap-2">
                <span className="text-sm text-text-muted break-all">{user.email}</span>
                <button
                  onClick={() => signOut()}
                  className="text-left text-text-secondary hover:text-text-primary transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}