'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { 
  LayoutDashboard, 
  Workflow, 
  Shield, 
  Menu, 
  X, 
  LogOut,
  Search,
  Bell,
  TrendingUp
} from 'lucide-react'
import { signOut } from '@/actions/auth'
import type { Profile } from '@/lib/types'
import type { DashboardStats } from '@/lib/queries'
import clsx from 'clsx'

export default function Nav({ 
  user, 
  stats 
}: { 
  user: Profile
  stats: DashboardStats
}) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const isAdmin = user.role === 'admin' || user.role === 'super_admin'
  const firstName = user.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Investor'

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/pipeline', label: 'Pipeline', icon: Workflow },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: Shield }] : []),
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      window.location.href = `/dashboard?search=${encodeURIComponent(searchValue.trim())}`
    }
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-[280px] bg-surface border-r border-border z-40">
        {/* Logo Section */}
        <div className="p-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-foreground leading-tight">
                Foreclosure
              </h1>
              <p className="text-xs text-ink-500 font-medium">Funder</p>
            </div>
          </Link>
        </div>

        {/* Welcome & Search Section */}
        <div className="p-5 space-y-4">
          <div className="zen-card p-4 bg-rice-50">
            <p className="text-xs text-ink-500 mb-1">Welcome back</p>
            <p className="font-semibold text-foreground">{firstName}</p>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-rice-50 border border-border rounded-lg text-sm
                         placeholder:text-ink-400 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10
                         transition-all"
            />
          </form>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-ink-600 hover:bg-rice-100 hover:text-ink-900'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Activity Summary */}
        <div className="px-5 pb-4">
          <div className="zen-card p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
              <Bell className="w-3.5 h-3.5" />
              Activity
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-600">Auctions this week</span>
              <span className="font-mono font-semibold text-warning">{stats.auctionScheduled}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-600">In pipeline</span>
              <span className="font-mono font-semibold text-accent">{stats.inPipeline}</span>
            </div>
          </div>
        </div>

        {/* User Section */}
        <div className="p-5 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-rice-200 rounded-full flex items-center justify-center">
              <span className="font-semibold text-ink-600">
                {firstName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.full_name || firstName}</p>
              <p className="text-xs text-ink-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                       text-sm font-medium text-ink-600 
                       hover:bg-rice-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-surface border-b border-border z-50">
        <div className="flex items-center justify-between h-full px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-foreground">Foreclosure Funder</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -mr-2 text-ink-600 hover:text-foreground"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-background z-40 p-4 space-y-4 animate-fade-in">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg text-sm
                         placeholder:text-ink-400 focus:outline-none focus:border-accent/50"
            />
          </form>

          {/* Mobile Activity Summary */}
          <div className="zen-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-ink-500" />
              <span className="text-sm text-ink-600">Activity</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="font-mono text-warning">{stats.auctionScheduled} auctions</span>
              <span className="font-mono text-accent">{stats.inPipeline} tracked</span>
            </div>
          </div>

          {/* Mobile Nav Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all',
                    isActive
                      ? 'bg-accent/10 text-accent'
                      : 'text-ink-600 hover:bg-rice-100'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Mobile User Section */}
          <div className="pt-4 border-t border-border">
            <p className="text-sm font-medium text-foreground mb-1">{user.full_name || firstName}</p>
            <p className="text-xs text-ink-500 mb-4">{user.email}</p>
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                signOut()
              }}
              className="w-full flex items-center justify-center gap-2 btn-secondary"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </>
  )
}
