'use client'

import { Property } from '@/lib/types'
import { StageBadge } from './stage-badge'
import { formatCurrency, formatDate, formatPropertyDetails, saleDateUrgency } from '@/lib/utils'
import { saveToPipeline } from '@/actions/pipeline'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ArrowRight } from 'lucide-react'
import clsx from 'clsx'
import { motion } from 'framer-motion'

export function PropertyCard({ property, isSavedInitial }: { property: Property; isSavedInitial: boolean }) {
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(isSavedInitial)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isSaved || isSaving) return

    setIsSaving(true)
    setIsSaved(true) // Optimistic update
    try {
      await saveToPipeline(property.id)
    } catch (err) {
      setIsSaved(false) // Revert on failure
    } finally {
      setIsSaving(false)
    }
  }

  const urgency = saleDateUrgency(property.sale_date)
  const dateColor = urgency === 'danger' ? 'text-danger font-bold' : urgency === 'warning' ? 'text-warning font-semibold' : 'text-text-secondary'

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onClick={() => router.push(`/property/${property.id}`)}
      className="card group cursor-pointer flex flex-col h-full relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full -z-10 group-hover:bg-accent/10 transition-colors duration-500" />
      <div className="absolute inset-0 border border-accent/0 group-hover:border-accent/20 rounded transition-colors duration-500 pointer-events-none" />
      
      <div className="mb-4 flex justify-between items-start">
        <StageBadge stage={property.stage} />
        <div className="text-accent opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          <ArrowRight size={18} />
        </div>
      </div>

      <div className="mb-1">
        <h3 className="font-display font-bold text-[18px] text-text-primary leading-tight group-hover:text-accent transition-colors duration-300">
          {property.address}
        </h3>
      </div>
      <div className="mb-4">
        <p className="font-body text-[13px] text-text-secondary">
          {property.city}, {property.state} {property.zip_code}
        </p>
      </div>

      <div className="font-data text-[14px] text-text-secondary mb-5 bg-surface-elevated/50 inline-block px-3 py-1.5 rounded self-start border border-border">
        {formatPropertyDetails(property.bedrooms, property.bathrooms, property.sqft) || 'Details unavailable'}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5 border-t border-border pt-4">
        <div>
          <span className="block text-[11px] uppercase text-text-muted mb-1 tracking-wide">County Appraisal</span>
          <span className="font-data text-[15px] text-text-primary">{formatCurrency(property.county_appraisal)}</span>
        </div>
        <div>
          <span className="block text-[11px] uppercase text-text-muted mb-1 tracking-wide">Foreclosure Amt</span>
          <span className="font-data text-[15px] text-text-primary">{formatCurrency(property.foreclosure_amount)}</span>
        </div>
      </div>

      <div className="mt-auto flex items-end justify-between border-t border-border pt-4">
        <div className="flex flex-col gap-1">
          {property.sale_date && (
            <span className={clsx("font-data text-[13px]", dateColor)}>
              Sale: {formatDate(property.sale_date)}
            </span>
          )}
          <span className="font-data text-[12px] text-text-muted">
            {property.case_number}
          </span>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaved || isSaving}
          className={clsx(
            "text-[13px] font-semibold px-4 py-2 rounded transition-all duration-300",
            isSaved 
              ? "bg-success/10 text-success cursor-default flex items-center gap-1.5 border border-success/20 shadow-[0_0_10px_rgba(45,138,94,0.2)]"
              : "btn-secondary hover:bg-surface-elevated hover:shadow-glow z-10 relative"
          )}
        >
          {isSaved ? (
            <>
              <Check size={14} strokeWidth={3} /> In Pipeline
            </>
          ) : (
            "Save to Pipeline"
          )}
        </button>
      </div>
    </motion.div>
  )
}