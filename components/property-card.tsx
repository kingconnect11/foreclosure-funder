'use client'

import Link from 'next/link'
import { Property } from '@/lib/types'
import { formatCurrency, formatDate, saleDateUrgency, formatPropertyDetails } from '@/lib/utils'
import { MapPin, Bed, Bath, Square, Calendar, ArrowRight } from 'lucide-react'
import { saveToPipeline } from '@/actions/pipeline'
import { useTransition, useState } from 'react'
import clsx from 'clsx'

interface PropertyCardProps {
  property: Property
  isSavedInitial: boolean
}

export function PropertyCard({ property, isSavedInitial }: PropertyCardProps) {
  const [isPending, startTransition] = useTransition()
  const [isSaved, setIsSaved] = useState(isSavedInitial)

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isSaved) return
    
    setIsSaved(true)
    startTransition(async () => {
      try {
        await saveToPipeline(property.id)
      } catch {
        setIsSaved(false)
      }
    })
  }

  const urgency = saleDateUrgency(property.sale_date)
  const stageBadgeClass = clsx(
    'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold',
    property.stage === 'new_filing' && 'bg-indigo/10 text-indigo',
    property.stage === 'sale_date_assigned' && 'bg-warning/10 text-warning-dark',
    property.stage === 'upcoming' && 'bg-danger/10 text-danger',
    (!property.stage || property.stage === 'sold' || property.stage === 'redeemed') && 'bg-ink-100 text-ink-500'
  )

  const stageLabels: Record<string, string> = {
    'new_filing': 'New Filing',
    'sale_date_assigned': 'Sale Date Set',
    'upcoming': 'Auction Soon',
    'sold': 'Sold',
    'redeemed': 'Redeemed',
    'canceled': 'Canceled',
  }
  const stageLabel = stageLabels[property.stage || ''] || property.stage?.replace(/_/g, ' ') || 'Unknown'

  return (
    <Link href={`/property/${property.id}`} className="block group">
      <article className="zen-card-interactive h-full flex flex-col">
        {/* Header with stage badge */}
        <div className="p-5 border-b border-border">
          <div className="flex items-start justify-between gap-3 mb-3">
            <span className={stageBadgeClass}>
              <span className={clsx(
                'w-1.5 h-1.5 rounded-full',
                urgency === 'danger' ? 'bg-danger animate-pulse-soft' : 
                urgency === 'warning' ? 'bg-warning' : 'bg-current'
              )} />
              {stageLabel}
            </span>
            <span className="font-mono text-xs text-ink-400 bg-rice-100 px-2 py-1 rounded">
              {property.case_number}
            </span>
          </div>
          
          <h3 className="font-display font-semibold text-lg text-foreground leading-snug group-hover:text-accent transition-colors">
            {property.address}
          </h3>
          <p className="flex items-center gap-1.5 text-sm text-ink-500 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {property.city}, {property.state} {property.zip_code}
          </p>
        </div>

        {/* Property details */}
        <div className="p-5 flex-1 space-y-3">
          {property.bedrooms || property.bathrooms || property.sqft ? (
            <div className="flex items-center gap-4 text-xs text-ink-500 flex-wrap">
              {property.bedrooms && (
                <span className="flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5" />
                  {property.bedrooms} bd
                </span>
              )}
              {property.bathrooms && (
                <span className="flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5" />
                  {property.bathrooms} ba
                </span>
              )}
              {property.sqft && (
                <span className="flex items-center gap-1">
                  <Square className="w-3.5 h-3.5" />
                  {property.sqft.toLocaleString()} sqft
                </span>
              )}
            </div>
          ) : null}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-500">Appraisal</span>
              <span className="font-mono font-semibold text-foreground">
                {formatCurrency(property.county_appraisal)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-500">Foreclosure</span>
              <span className="font-mono font-semibold text-foreground">
                {formatCurrency(property.foreclosure_amount)}
              </span>
            </div>
            {property.sale_date && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Sale Date
                </span>
                <span className={clsx(
                  'font-mono font-semibold',
                  urgency === 'danger' ? 'text-danger' : 
                  urgency === 'warning' ? 'text-warning-dark' : 'text-foreground'
                )}>
                  {formatDate(property.sale_date)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action button */}
        <div className="p-5 pt-0">
          <button
            onClick={handleSave}
            disabled={isSaved || isPending}
            className={clsx(
              'w-full flex items-center justify-center gap-2 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-all',
              isSaved
                ? 'bg-success/10 text-success cursor-default'
                : 'bg-rice-100 text-ink-700 hover:bg-accent hover:text-white'
            )}
          >
            {isSaved ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                In Pipeline
              </>
            ) : (
              <>
                Add to Pipeline
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </article>
    </Link>
  )
}
