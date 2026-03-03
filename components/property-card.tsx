'use client'

import Link from 'next/link'
import { Property } from '@/lib/types'
import { formatCurrency, formatDate, saleDateUrgency, formatPropertyDetails } from '@/lib/utils'
import StageBadge from './stage-badge'
import { saveToPipeline } from '@/actions/pipeline'
import { useTransition, useState } from 'react'
import { MapPin } from 'lucide-react'

export function PropertyCard({ property, isSavedInitial }: { property: Property, isSavedInitial: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [isSaved, setIsSaved] = useState(isSavedInitial)
  const [errorText, setErrorText] = useState<string | null>(null)

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isSaved) return
    setErrorText(null)
    setIsSaved(true)
    startTransition(async () => {
      try {
        await saveToPipeline(property.id)
      } catch {
        setIsSaved(false)
        setErrorText('Could not save. Try again.')
      }
    })
  }

  const urgency = saleDateUrgency(property.sale_date)

  return (
    <Link href={`/property/${property.id}`} className="block group h-full">
      <article className="dossier-card group-hover:border-border-hover hover:shadow-lift h-full flex flex-col">
        <div className="p-5 border-b border-border flex justify-between items-start gap-3">
          <div>
            <StageBadge stage={property.stage} className="mb-4" />
            <h3 className="font-display text-[1.4rem] text-text-primary mb-1 leading-tight group-hover:text-accent transition-colors">
              {property.address}
            </h3>
            <p className="text-text-secondary text-sm font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {property.city}, {property.state} {property.zip_code}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="font-data text-[11px] text-text-muted border border-border px-1.5 py-0.5 rounded-lg financial-value">
              {property.case_number}
            </span>
          </div>
        </div>

        <div className="p-5 space-y-3 flex-grow">
          <div className="flex justify-between items-end ledger-divider pb-2">
            <span className="kicker">Property</span>
            <span className="text-sm font-medium text-text-primary text-right">{formatPropertyDetails(property.bedrooms, property.bathrooms, property.sqft)}</span>
          </div>
          <div className="flex justify-between items-end ledger-divider pb-2">
            <span className="kicker">Appraisal</span>
            <span className="text-sm financial-value text-text-primary">{formatCurrency(property.county_appraisal)}</span>
          </div>
          <div className="flex justify-between items-end ledger-divider pb-2">
            <span className="kicker">Foreclosure</span>
            <span className="text-sm financial-value text-text-primary">{formatCurrency(property.foreclosure_amount)}</span>
          </div>
          {property.sale_date && (
            <div className="flex justify-between items-end ledger-divider pb-2 border-b-0">
              <span className="kicker">Sale Date</span>
              <span className={`text-sm financial-value ${urgency === 'danger' ? 'text-danger' : urgency === 'warning' ? 'text-warning' : 'text-text-primary'}`}>
                {formatDate(property.sale_date)}
              </span>
            </div>
          )}
        </div>
        <div className="px-5 pb-5 pt-2 mt-auto space-y-2">
          <button 
            onClick={handleSave}
            disabled={isSaved || isPending}
            className={`w-full py-2.5 text-xs font-semibold uppercase tracking-[0.1em] rounded-lg transition-all ${
              isSaved 
                ? 'bg-surface-elevated border border-border text-text-muted cursor-not-allowed'
                : 'bg-transparent border border-accent text-accent hover:bg-accent hover:text-background'
            }`}
          >
            {isSaved ? 'In Pipeline' : 'Save to Pipeline'}
          </button>
          {errorText ? (
            <p className="text-xs text-danger">{errorText}</p>
          ) : null}
        </div>
      </article>
    </Link>
  )
}
