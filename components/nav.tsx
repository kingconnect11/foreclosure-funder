'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { signOut } from '@/actions/auth'
import type { Profile, DealRoom } from '@/lib/types'
import clsx from 'clsx'

type BrandColors = {
  primary?: string
  secondary?: string
  accent?: string
}

function parseBrandColors(raw: DealRoom['brand_colors']): BrandColors | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  return raw as BrandColors
}

export default function Nav({ user, dealRoom }: { user: Profile; dealRoom?: DealRoom | null }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const isAdmin = user.role === 'admin' || user.role === 'super_admin'

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/pipeline', label: 'Pipeline' },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin' }] : []),
  ]

  const brandColors = parseBrandColors(dealRoom?.brand_colors ?? null)
  const brandStyle = brandColors
    ? ({
        '--brand-primary': brandColors.primary,
        '--brand-secondary': brandColors.secondary,
        '--brand-accent': brandColors.accent,
      } as React.CSSProperties)
    : undefined

  return (
    <nav className="sticky top-0 z-50 w-full bg-background border-b border-border" style={brandStyle}>
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            {dealRoom?.brand_logo_url ? (
              <Image
                src={dealRoom.brand_logo_url}
                alt={dealRoom.name}
                width={120}
                height={32}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <span
                className="font-display font-bold text-[20px] tracking-wide"
                style={brandColors?.accent ? { color: brandColors.accent } : undefined}
              >
                {dealRoom?.name ?? 'Foreclosure Funder'}
              </span>
            )}
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'text-sm font-medium transition-colors',
                  pathname.startsWith(link.href)
                    ? 'text-accent'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <span className="text-sm text-text-muted">{user.email}</span>
          <button
            onClick={() => signOut()}
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Sign out
          </button>
        </div>

        <button
          className="md:hidden text-text-primary p-2 -mr-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border bg-background px-6 py-4 space-y-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={clsx(
                'block text-base font-medium',
                pathname.startsWith(link.href)
                  ? 'text-accent'
                  : 'text-text-secondary'
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 mt-4 border-t border-border flex flex-col gap-4">
            <span className="text-sm text-text-muted">{user.email}</span>
            <button
              onClick={() => {
                setIsOpen(false)
                signOut()
              }}
              className="text-left text-base font-medium text-text-secondary"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
