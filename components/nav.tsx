'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/actions/auth'
import { Profile } from '@/lib/types'
import type { DashboardStats } from '@/lib/queries'
import { BellDot, LayoutDashboard, LogOut, Menu, Search, Shield, Workflow, X } from 'lucide-react'
import { FormEvent, useState } from 'react'
import clsx from 'clsx'

export default function Nav({
  user,
  stats,
}: {
  user: Profile
  stats: DashboardStats
}) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  
  const isAdmin = user.role === 'admin' || user.role === 'super_admin'
  const firstName = user.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Investor'
  const notifications = stats.auctionScheduled + stats.inPipeline

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/pipeline', label: 'Pipeline', icon: Workflow },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: Shield }] : []),
  ]

  const onSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = searchText.trim()
    const params = new URLSearchParams()
    if (query) params.set('search', query)
    window.location.href = `/dashboard${params.toString() ? `?${params.toString()}` : ''}`
  }

  const LinkBlock = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={clsx('flex gap-2', mobile ? 'flex-col' : 'flex-col')}>
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
        const Icon = link.icon
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileMenuOpen(false)}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-colors',
              active
                ? 'bg-accent text-background shadow-card'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="font-semibold tracking-wide">{link.label}</span>
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col sticky top-0 h-screen border-r border-border bg-surface px-4 py-5">
        <Link href="/dashboard" className="dossier-card p-3 mb-4 bg-surface-elevated">
          <p className="kicker mb-1">Foreclosure Funder</p>
          <h1 className="font-display text-2xl leading-tight">Auction Intelligence</h1>
        </Link>

        <div className="soft-panel p-3 mb-4">
          <p className="kicker">Welcome</p>
          <p className="text-lg font-semibold mt-1">{firstName}</p>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-text-muted">Upcoming auctions</span>
            <span className="financial-value text-warning">{stats.auctionScheduled}</span>
          </div>
        </div>

        <form onSubmit={onSearchSubmit} className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="input-field pl-9"
            placeholder="Search address or case #"
          />
        </form>

        <LinkBlock />

        <Link href="/pipeline" className="soft-panel mt-4 p-3 block hover:border-border-hover transition-colors">
          <div className="flex items-center justify-between">
            <span className="kicker flex items-center gap-1.5">
              <BellDot className="w-3.5 h-3.5" />
              Activity
            </span>
            <span className="financial-value text-sm">{notifications}</span>
          </div>
          <p className="text-xs text-text-secondary mt-1">Items requiring attention</p>
        </Link>

        <div className="mt-auto soft-panel p-3">
          <p className="text-sm font-medium truncate">{user.full_name || 'Account'}</p>
          <p className="text-xs text-text-muted truncate mb-3">{user.email}</p>
          <button onClick={() => signOut()} className="btn-secondary w-full flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      <header className="lg:hidden sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur p-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="kicker">Foreclosure Funder</p>
          <p className="font-display text-xl truncate">Welcome, {firstName}</p>
        </div>
        <button 
          className="p-2 text-text-secondary hover:text-text-primary"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {mobileMenuOpen && (
        <div className="lg:hidden p-4 border-b border-border bg-surface space-y-3">
          <form onSubmit={onSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="input-field pl-9"
              placeholder="Search address or case #"
            />
          </form>
          <div className="soft-panel p-3 text-xs flex items-center justify-between">
            <span className="text-text-secondary">Activity alerts</span>
            <span className="financial-value">{notifications}</span>
          </div>
          <LinkBlock mobile />
          <button onClick={() => signOut()} className="btn-secondary w-full flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
    </>
  )
}
