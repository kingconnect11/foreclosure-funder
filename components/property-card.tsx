'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Check } from 'lucide-react'
import { saveToPipeline } from '@/actions/pipeline'
import { formatCurrency, formatDate, formatPropertyDetails, saleDateUrgency } from '@/lib/utils'
import type { Property } from '@/lib/types'
import { StageBadge } from '@/components/stage-badge'
import clsx from 'clsx'

interface PropertyCardProps {
  property: Property
  initiallySaved: boolean
}

export function PropertyCard({ property, initiallySaved }: PropertyCardProps) {
  const router = useRouter()
  const [saved, setSaved] = useState(initiallySaved)
  const [isPending, startTransition] = useTransition()

  const urgency = saleDateUrgency(property.sale_date)

  return (
    <article
      className="cursor-pointer rounded-card border border-border bg-surface p-5 transition hover:border-surface-elevated"
      onClick={() => router.push(`/property/${property.id}`)}
    >
      <div className="mb-4">
        <StageBadge stage={property.stage} />
      </div>

      <h3 className="mb-1 text-[15px] font-semibold leading-[1.4] text-text-primary">
        {property.address ?? '--'}
      </h3>
      <p className="mb-3 text-sm text-text-secondary">
        {[property.city, property.state, property.zip_code].filter(Boolean).join(', ')}
      </p>

      <p className="mb-4 font-data text-sm text-text-secondary">
        {formatPropertyDetails(property.bedrooms, property.bathrooms, property.sqft) || '--'}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-[0.08em] text-text-muted">
            County Appraisal
          </p>
          <p className="font-data text-sm text-text-primary">
            {formatCurrency(property.county_appraisal)}
          </p>
        </div>
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-[0.08em] text-text-muted">
            Foreclosure Amt
          </p>
          <p className="font-data text-sm text-text-primary">
            {formatCurrency(property.foreclosure_amount)}
          </p>
        </div>
      </div>

      {property.sale_date && (
        <p
          className={clsx(
            'mb-4 font-data text-[13px]',
            urgency === 'danger'
              ? 'text-danger'
              : urgency === 'warning'
                ? 'text-warning'
                : 'text-text-secondary'
          )}
        >
          Sale: {formatDate(property.sale_date)}
        </p>
      )}

      <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
        <p className="font-data text-xs text-text-muted">{property.case_number}</p>

        {saved ? (
          <span className="inline-flex items-center gap-1 rounded-card border border-success/40 bg-success/15 px-3 py-2 text-xs uppercase tracking-[0.08em] text-success">
            In Pipeline <Check size={12} />
          </span>
        ) : (
          <button
            type="button"
            className="rounded-card border border-border px-3 py-2 text-xs uppercase tracking-[0.08em] text-text-secondary transition hover:border-text-secondary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60"
            onClick={(e) => {
              e.stopPropagation()
              if (isPending || saved) return
              setSaved(true)
              startTransition(async () => {
                try {
                  await saveToPipeline(property.id)
                } catch {
                  setSaved(false)
                }
              })
            }}
            disabled={isPending}
          >
            {isPending ? 'Saving...' : 'Save to Pipeline'}
          </button>
        )}
      </div>
    </article>
  )
}
