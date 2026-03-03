'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState, useEffect, Suspense } from 'react'
import { ListFilter, Search, SlidersHorizontal, X } from 'lucide-react'
import clsx from 'clsx'

function FilterBarContent({ cities }: { cities: string[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    setSearch(searchParams.get('search') || '')
  }, [searchParams])

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      params.delete('page')
      return params.toString()
    },
    [searchParams]
  )

  const handleFilterChange = (name: string, value: string) => {
    router.push(`${pathname}?${createQueryString(name, value)}`)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`${pathname}?${createQueryString('search', search)}`)
  }

  const clearFilters = () => {
    router.push(pathname)
    setSearch('')
  }

  const hasFilters = searchParams.get('stage') || searchParams.get('city') || searchParams.get('sort') || searchParams.get('search')

  return (
    <div className="zen-card p-4 lg:p-5">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Search - Always visible */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            placeholder="Search address or case number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-rice-50 border border-border rounded-lg text-sm
                       placeholder:text-ink-400 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10
                       transition-all"
          />
        </form>

        {/* Filter Toggle on Mobile */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={clsx(
            'lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
            isExpanded ? 'bg-accent text-white' : 'bg-rice-100 text-ink-700'
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>

        {/* Desktop Filters - Always visible */}
        <div className="hidden lg:flex items-center gap-3">
          <select
            value={searchParams.get('stage') || ''}
            onChange={(e) => handleFilterChange('stage', e.target.value)}
            className="input-zen w-[140px]"
          >
            <option value="">All Stages</option>
            <option value="new_filing">New Filing</option>
            <option value="sale_date_assigned">Sale Date Set</option>
            <option value="upcoming">Auction Soon</option>
          </select>

          <select
            value={searchParams.get('city') || ''}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            className="input-zen w-[160px]"
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          <select
            value={searchParams.get('sort') || ''}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="input-zen w-[160px]"
          >
            <option value="">Newest First</option>
            <option value="sale_date">Sale Date</option>
            <option value="value_high">Value: High-Low</option>
            <option value="value_low">Value: Low-High</option>
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-ink-500 
                         hover:text-danger transition-colors"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Mobile Expanded Filters */}
      {isExpanded && (
        <div className="lg:hidden mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
          <select
            value={searchParams.get('stage') || ''}
            onChange={(e) => handleFilterChange('stage', e.target.value)}
            className="input-zen"
          >
            <option value="">All Stages</option>
            <option value="new_filing">New Filing</option>
            <option value="sale_date_assigned">Sale Date Set</option>
            <option value="upcoming">Auction Soon</option>
          </select>

          <select
            value={searchParams.get('city') || ''}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            className="input-zen"
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          <select
            value={searchParams.get('sort') || ''}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="input-zen"
          >
            <option value="">Newest First</option>
            <option value="sale_date">Sale Date</option>
            <option value="value_high">Value: High-Low</option>
            <option value="value_low">Value: Low-High</option>
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center justify-center gap-2 btn-secondary sm:col-span-3"
            >
              <X className="w-4 h-4" />
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function FilterBar({ cities }: { cities: string[] }) {
  return (
    <Suspense fallback={<div className="zen-card h-[80px] animate-pulse bg-rice-100" />}>
      <FilterBarContent cities={cities} />
    </Suspense>
  )
}
