'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export function FilterBar({ cities }: { cities: string[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.push(`/dashboard?${params.toString()}`)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (search) {
        params.set('search', search)
      } else {
        params.delete('search')
      }
      params.delete('page')
      
      const currentSearch = searchParams.get('search') || ''
      if (currentSearch !== search) {
          router.push(`/dashboard?${params.toString()}`)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [search, router, searchParams])

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <select 
        className="bg-surface border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
        value={searchParams.get('stage') || 'all'}
        onChange={(e) => updateParam('stage', e.target.value)}
      >
        <option value="all">All Stages</option>
        <option value="new_filing">New Filing</option>
        <option value="sale_date_assigned">Sale Date Assigned</option>
        <option value="upcoming">Upcoming Auction</option>
      </select>

      <select
        className="bg-surface border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
        value={searchParams.get('city') || 'all'}
        onChange={(e) => updateParam('city', e.target.value)}
      >
        <option value="all">All Cities</option>
        {cities.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        className="bg-surface border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
        value={searchParams.get('sort') || 'newest'}
        onChange={(e) => updateParam('sort', e.target.value)}
      >
        <option value="newest">Newest First</option>
        <option value="sale_date">Sale Date (soonest)</option>
        <option value="value_high">Appraised Value (High to Low)</option>
        <option value="value_low">Appraised Value (Low to High)</option>
      </select>

      <input
        type="text"
        placeholder="Search address or case..."
        className="bg-surface border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent flex-1"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  )
}