'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState, useEffect, Suspense } from 'react'
import { ListFilter, Search } from 'lucide-react'

function FilterBarContent({ cities }: { cities: string[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(searchParams.get('search') || '')

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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (searchParams.get('search') || '')) {
        handleFilterChange('search', search)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [search, searchParams]) // Added searchParams to dependencies

  return (
    <div className="dossier-card p-4 mb-6 md:mb-8">
      <div className="flex items-center gap-2 mb-3">
        <ListFilter className="w-4 h-4 text-text-muted" />
        <span className="kicker">Filters</span>
      </div>
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        <div className="flex-1 w-full relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search by address or case number..." 
            className="input-field pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:w-auto">
          <select 
            className="input-field h-full text-xs font-semibold uppercase tracking-wider min-w-[160px]"
            value={searchParams.get('stage') || ''}
            onChange={(e) => handleFilterChange('stage', e.target.value)}
          >
            <option value="" className="bg-surface text-text-primary">All Stages</option>
            <option value="new_filing" className="bg-surface text-text-primary">New Filing</option>
            <option value="sale_date_assigned" className="bg-surface text-text-primary">Sale Date Set</option>
            <option value="upcoming" className="bg-surface text-text-primary">Upcoming Auction</option>
          </select>
          
          <select 
            className="input-field h-full text-xs font-semibold uppercase tracking-wider min-w-[160px]"
            value={searchParams.get('city') || ''}
            onChange={(e) => handleFilterChange('city', e.target.value)}
          >
            <option value="" className="bg-surface text-text-primary">All Cities</option>
            {cities.map((c) => <option key={c} value={c} className="bg-surface text-text-primary">{c}</option>)}
          </select>
          
          <select 
            className="input-field h-full text-xs font-semibold uppercase tracking-wider min-w-[180px]"
            value={searchParams.get('sort') || ''}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
          >
            <option value="" className="bg-surface text-text-primary">Newest First</option>
            <option value="sale_date" className="bg-surface text-text-primary">Sale Date (Soonest)</option>
            <option value="value_high" className="bg-surface text-text-primary">Appraisal (High to Low)</option>
            <option value="value_low" className="bg-surface text-text-primary">Appraisal (Low to High)</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export function FilterBar({ cities }: { cities: string[] }) {
  return (
    <Suspense fallback={<div className="dossier-card h-[122px] mb-8 animate-pulse bg-surface/50" />}>
      <FilterBarContent cities={cities} />
    </Suspense>
  )
}
