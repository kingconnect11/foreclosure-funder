'use client'

import Link from 'next/link'
import { Property } from '@/lib/types'
import { formatCurrency, formatDate, saleDateUrgency, formatPropertyDetails } from '@/lib/utils'
import StageBadge from './stage-badge'
import { saveToPipeline } from '@/actions/pipeline'
import { useTransition, useState } from 'react'

export function PropertyCard({ property, isSavedInitial }: { property: Property, isSavedInitial: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [isSaved, setIsSaved] = useState(isSavedInitial)

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault() // prevent navigating to link
    e.stopPropagation()
    if (isSaved) return
    setIsSaved(true)
    startTransition(async () => {
      await saveToPipeline(property.id)
    })
  }

  const urgency = saleDateUrgency(property.sale_date)

  return (
    <Link href={`/property/${property.id}`} className="block group">
      <div className="dossier-card group-hover:border-text-secondary transition-colors duration-300 h-full flex flex-col">
        <div className="p-5 border-b border-border flex justify-between items-start">
          <div>
            <StageBadge stage={property.stage} className="mb-4" />
            <h3 className="font-display text-2xl text-text-primary mb-1 group-hover:text-accent transition-colors">{property.address}</h3>
            <p className="text-text-secondary text-sm font-medium">{property.city}, {property.state} {property.zip_code}</p>
          </div>
          <div className="text-right">
            <span className="font-data text-[11px] text-text-muted border border-border px-1.5 py-0.5 rounded-sm">{property.case_number}</span>
          </div>
        </div>
        <div className="p-5 space-y-3 flex-grow">
          <div className="flex justify-between items-end ledger-divider pb-2">
            <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">Property</span>
            <span className="text-sm font-medium text-text-primary text-right">{formatPropertyDetails(property.bedrooms, property.bathrooms, property.sqft)}</span>
          </div>
          <div className="flex justify-between items-end ledger-divider pb-2">
            <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">Appraisal</span>
            <span className="text-sm font-data text-text-primary">{formatCurrency(property.county_appraisal)}</span>
          </div>
          <div className="flex justify-between items-end ledger-divider pb-2">
            <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">Foreclosure</span>
            <span className="text-sm font-data text-text-primary">{formatCurrency(property.foreclosure_amount)}</span>
          </div>
          {property.sale_date && (
            <div className="flex justify-between items-end ledger-divider pb-2 border-b-0">
              <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">Sale Date</span>
              <span className={`text-sm font-data ${urgency === 'danger' ? 'text-danger' : urgency === 'warning' ? 'text-warning' : 'text-text-primary'}`}>
                {formatDate(property.sale_date)}
              </span>
            </div>
          )}
        </div>
        <div className="px-5 pb-5 pt-2 mt-auto">
          <button 
            onClick={handleSave}
            disabled={isSaved || isPending}
            className={`w-full py-2.5 text-xs font-semibold uppercase tracking-[0.1em] rounded-sm transition-all ${
              isSaved 
                ? 'bg-surface-elevated border border-border text-text-muted cursor-not-allowed'
                : 'bg-transparent border border-accent text-accent hover:bg-accent hover:text-[#0A0A0C]'
            }`}
          >
            {isSaved ? 'In Pipeline' : 'Save to Pipeline'}
          </button>
        </div>
      </div>
    </Link>
  )
}
