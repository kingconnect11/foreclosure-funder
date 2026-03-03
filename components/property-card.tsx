'use client'

import { Property } from '@/lib/types'
import { formatCurrency, formatDate, saleDateUrgency, formatPropertyDetails } from '@/lib/utils'
import { StageBadge } from './stage-badge'
import { saveToPipeline } from '@/actions/pipeline'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'

export function PropertyCard({ property, isSavedInitial }: { property: Property, isSavedInitial: boolean }) {
  const [isSaved, setIsSaved] = useState(isSavedInitial)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isSaved || isSaving) return
    setIsSaving(true)
    setIsSaved(true)
    try {
      await saveToPipeline(property.id)
    } catch (err) {
      setIsSaved(false)
    } finally {
      setIsSaving(false)
    }
  }

  const urgency = saleDateUrgency(property.sale_date)

  return (
    <div 
      onClick={() => router.push(`/property/${property.id}`)}
      className="bg-surface border border-border rounded p-5 hover:border-surface-elevated transition-colors cursor-pointer flex flex-col gap-4"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-col gap-1 w-full">
          <div className="mb-1">
            <StageBadge stage={property.stage} />
          </div>
          <h3 className="font-body font-semibold text-[15px] text-text-primary line-clamp-1">{property.address}</h3>
          <p className="text-[13px] text-text-secondary line-clamp-1">{property.city}, {property.state} {property.zip_code}</p>
        </div>
      </div>

      <div className="font-data text-[14px] text-text-secondary">
        {formatPropertyDetails(property.bedrooms, property.bathrooms, property.sqft)}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-[11px] text-text-muted uppercase tracking-[0.05em] font-medium mb-1">County Appraisal</div>
          <div className="font-data text-[14px] text-text-primary">{formatCurrency(property.county_appraisal)}</div>
        </div>
        <div>
          <div className="text-[11px] text-text-muted uppercase tracking-[0.05em] font-medium mb-1">Foreclosure Amt</div>
          <div className="font-data text-[14px] text-text-primary">{formatCurrency(property.foreclosure_amount)}</div>
        </div>
      </div>

      {property.sale_date && (
        <div className={clsx(
          "font-data text-[13px] flex items-center gap-2 flex-wrap",
          urgency === 'danger' && "text-danger",
          urgency === 'warning' && "text-warning",
          urgency === 'normal' && "text-text-secondary"
        )}>
          {urgency === 'danger' && (
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-danger" />
            </span>
          )}
          {urgency === 'warning' && (
            <span className="inline-block h-2 w-2 rounded-full bg-warning shrink-0" />
          )}
          <span>Sale: {formatDate(property.sale_date)}</span>
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
        <span className="font-data text-[12px] text-text-muted">{property.case_number}</span>
        <button 
          onClick={handleSave}
          disabled={isSaved || isSaving}
          className={clsx(
            "text-[14px] font-semibold px-4 py-2 rounded transition-colors",
            isSaved 
              ? "text-text-secondary bg-transparent cursor-default" 
              : "border border-border text-text-secondary hover:border-text-secondary"
          )}
        >
          {isSaved ? "In Pipeline ✓" : "Save to Pipeline"}
        </button>
      </div>
    </div>
  )
}