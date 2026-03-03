'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState, useEffect, Suspense } from 'react'

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
    <div className="dossier-card p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
      <div className="flex-1 w-full relative">
        <input 
          type="text" 
          placeholder="Search by address or case number..." 
          className="w-full bg-transparent border-0 border-b border-border border-dashed pb-2 text-sm text-text-primary focus:outline-none focus:border-accent font-body placeholder:text-text-muted"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap w-full md:w-auto gap-4">
        <select 
          className="bg-transparent border border-border rounded-sm py-1.5 px-3 text-xs text-text-secondary cursor-pointer focus:outline-none focus:border-accent hover:border-text-muted transition-colors uppercase tracking-wider font-semibold"
          value={searchParams.get('stage') || ''}
          onChange={(e) => handleFilterChange('stage', e.target.value)}
        >
          <option value="" className="bg-surface text-text-primary">All Stages</option>
          <option value="new_filing" className="bg-surface text-text-primary">New Filing</option>
          <option value="sale_date_assigned" className="bg-surface text-text-primary">Sale Date Set</option>
          <option value="upcoming" className="bg-surface text-text-primary">Upcoming Auction</option>
        </select>
        
        <select 
          className="bg-transparent border border-border rounded-sm py-1.5 px-3 text-xs text-text-secondary cursor-pointer focus:outline-none focus:border-accent hover:border-text-muted transition-colors uppercase tracking-wider font-semibold"
          value={searchParams.get('city') || ''}
          onChange={(e) => handleFilterChange('city', e.target.value)}
        >
          <option value="" className="bg-surface text-text-primary">All Cities</option>
          {cities.map(c => <option key={c} value={c} className="bg-surface text-text-primary">{c}</option>)}
        </select>
        
        <select 
          className="bg-transparent border border-border rounded-sm py-1.5 px-3 text-xs text-text-secondary cursor-pointer focus:outline-none focus:border-accent hover:border-text-muted transition-colors uppercase tracking-wider font-semibold"
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
  )
}

export function FilterBar({ cities }: { cities: string[] }) {
  return (
    <Suspense fallback={<div className="dossier-card h-[72px] mb-8 animate-pulse bg-surface/50"></div>}>
      <FilterBarContent cities={cities} />
    </Suspense>
  )
}
