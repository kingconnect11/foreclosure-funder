'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface FilterBarProps {
  cities: string[]
}

const STAGE_OPTIONS = [
  { value: '', label: 'All Stages' },
  { value: 'new_filing', label: 'New Filing' },
  { value: 'sale_date_assigned', label: 'Sale Date Assigned' },
  { value: 'upcoming', label: 'Upcoming Auction' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'sale_date', label: 'Sale Date (Soonest)' },
  { value: 'value_high', label: 'Appraised Value (High to Low)' },
  { value: 'value_low', label: 'Appraised Value (Low to High)' },
]

export function FilterBar({ cities }: FilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '')

  useEffect(() => {
    setSearchInput(searchParams.get('search') ?? '')
  }, [searchParams])

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (!value) params.delete(key)
    else params.set(key, value)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  const submitSearch = () => {
    updateParam('search', searchInput.trim())
  }

  return (
    <section className="rounded-card border border-border bg-surface p-4">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <label className="lg:col-span-3">
          <span className="mb-1 block text-xs uppercase tracking-[0.08em] text-text-muted">
            Stage
          </span>
          <select
            className="h-10 w-full rounded-card border border-border bg-bg px-3 text-sm text-text-primary outline-none transition focus:border-accent"
            value={searchParams.get('stage') ?? ''}
            onChange={(e) => updateParam('stage', e.target.value)}
          >
            {STAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="lg:col-span-3">
          <span className="mb-1 block text-xs uppercase tracking-[0.08em] text-text-muted">
            City
          </span>
          <select
            className="h-10 w-full rounded-card border border-border bg-bg px-3 text-sm text-text-primary outline-none transition focus:border-accent"
            value={searchParams.get('city') ?? ''}
            onChange={(e) => updateParam('city', e.target.value)}
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>

        <label className="lg:col-span-3">
          <span className="mb-1 block text-xs uppercase tracking-[0.08em] text-text-muted">
            Sort
          </span>
          <select
            className="h-10 w-full rounded-card border border-border bg-bg px-3 text-sm text-text-primary outline-none transition focus:border-accent"
            value={searchParams.get('sort') ?? 'newest'}
            onChange={(e) => updateParam('sort', e.target.value)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="lg:col-span-3">
          <span className="mb-1 block text-xs uppercase tracking-[0.08em] text-text-muted">
            Search
          </span>
          <div className="flex gap-2">
            <input
              className="h-10 w-full rounded-card border border-border bg-bg px-3 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  submitSearch()
                }
              }}
              placeholder="Address or case number"
            />
            <button
              type="button"
              onClick={submitSearch}
              className="h-10 rounded-card border border-border px-4 text-xs uppercase tracking-[0.08em] text-text-secondary transition hover:border-text-secondary hover:text-text-primary"
            >
              Apply
            </button>
          </div>
        </label>
      </div>
    </section>
  )
}
