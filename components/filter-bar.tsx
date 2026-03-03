"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "./ui/input"
import { Search } from "lucide-react"

export function FilterBar({ cities }: { cities: string[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <Input 
          placeholder="Search address or case number..." 
          className="pl-9"
          defaultValue={searchParams.get("search") || ""}
          onChange={(e) => {
            // Simplified without debounce for now
            updateParam("search", e.target.value)
          }}
        />
      </div>
      <select 
        className="h-9 rounded-sharp border border-border bg-surface-1 px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-pine text-foreground"
        value={searchParams.get("stage") || ""}
        onChange={(e) => updateParam("stage", e.target.value)}
      >
        <option value="">All Stages</option>
        <option value="new_filing">New Filing</option>
        <option value="sale_date_assigned">Sale Date Assigned</option>
        <option value="upcoming">Upcoming Auction</option>
      </select>
      <select
        className="h-9 rounded-sharp border border-border bg-surface-1 px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-pine text-foreground"
        value={searchParams.get("city") || ""}
        onChange={(e) => updateParam("city", e.target.value)}
      >
        <option value="">All Cities</option>
        {cities.map(city => (
          <option key={city} value={city}>{city}</option>
        ))}
      </select>
      <select
        className="h-9 rounded-sharp border border-border bg-surface-1 px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-pine text-foreground"
        value={searchParams.get("sort") || ""}
        onChange={(e) => updateParam("sort", e.target.value)}
      >
        <option value="newest">Newest First</option>
        <option value="sale_date">Sale Date (Soonest)</option>
        <option value="value_high">Appraisal (High to Low)</option>
        <option value="value_low">Appraisal (Low to High)</option>
      </select>
    </div>
  )
}
