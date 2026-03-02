'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react'
import { Search } from 'lucide-react'

export function FilterBar({ cities }: { cities: string[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      // Reset page to 0 on new filters
      if (name !== 'page') params.delete('page')
      return params.toString()
    },
    [searchParams]
  )

  const handleSelectChange = (name: string, value: string) => {
    router.push(pathname + '?' + createQueryString(name, value))
  }

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== (searchParams.get('search') || '')) {
        router.push(pathname + '?' + createQueryString('search', searchValue))
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchValue, router, pathname, createQueryString, searchParams])

  return (
    <div className="bg-surface border border-border rounded p-4 mb-8 flex flex-col md:flex-row gap-4 items-center shadow-sm">
      <div className="flex-1 w-full flex items-center gap-4">
        <select
          className="bg-background border border-border rounded px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          value={searchParams.get('stage') || ''}
          onChange={(e) => handleSelectChange('stage', e.target.value)}
        >
          <option value="">All Stages</option>
          <option value="new_filing">New Filing</option>
          <option value="sale_date_assigned">Sale Date Assigned</option>
          <option value="upcoming">Upcoming Auction</option>
        </select>

        <select
          className="bg-background border border-border rounded px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          value={searchParams.get('city') || ''}
          onChange={(e) => handleSelectChange('city', e.target.value)}
        >
          <option value="">All Cities</option>
          {cities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        <select
          className="bg-background border border-border rounded px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          value={searchParams.get('sort') || ''}
          onChange={(e) => handleSelectChange('sort', e.target.value)}
        >
          <option value="">Newest First</option>
          <option value="sale_date">Sale Date (soonest)</option>
          <option value="value_high">Appraisal (High to Low)</option>
          <option value="value_low">Appraisal (Low to High)</option>
        </select>
      </div>

      <div className="relative w-full md:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
        <input
          type="text"
          placeholder="Search address or case..."
          className="w-full bg-background border border-border rounded pl-9 pr-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>
    </div>
  )
}