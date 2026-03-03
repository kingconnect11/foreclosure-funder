'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/actions/auth'
import { Profile } from '@/lib/types'
import { LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

export default function Nav({ user }: { user: Profile }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const isAdmin = user.role === 'admin' || user.role === 'super_admin'

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/pipeline', label: 'Pipeline' },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="font-display text-2xl tracking-wide text-accent leading-none pt-1">
              Foreclosure Funder
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "px-4 py-2 text-sm font-medium transition-colors rounded-sm",
                    active 
                      ? "text-primary bg-surface-elevated" 
                      : "text-text-secondary hover:text-text-primary hover:bg-surface"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <span className="text-sm font-data text-text-muted">
            {user.email}
          </span>
          <div className="h-4 w-px bg-border"></div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors group"
          >
            <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            <span className="font-medium uppercase tracking-wider text-[11px]">Sign Out</span>
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button 
          className="md:hidden p-2 text-text-secondary hover:text-text-primary"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-surface px-6 py-4 space-y-4">
          <nav className="flex flex-col gap-2">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    "px-4 py-3 text-sm font-medium rounded-sm",
                    active 
                      ? "text-primary bg-surface-elevated border-l-2 border-accent" 
                      : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
          <div className="pt-4 border-t border-border flex flex-col gap-4">
            <span className="text-sm font-data text-text-muted px-4">
              {user.email}
            </span>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors px-4 py-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium uppercase tracking-wider text-[11px]">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
