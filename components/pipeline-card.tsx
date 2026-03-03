import { InvestorPipeline, Property } from '@/lib/types'
import { formatCurrency, formatDate, saleDateUrgency, timeInStage } from '@/lib/utils'
import Link from 'next/link'
import clsx from 'clsx'

export type PipelineEntryWithProperty = InvestorPipeline & { properties: Property }

export function PipelineCard({ entry }: { entry: PipelineEntryWithProperty }) {
  const { properties: property } = entry
  
  const urgency = saleDateUrgency(property.sale_date)
  const notesPreview = entry.notes && entry.notes.length > 60 
    ? entry.notes.substring(0, 60) + '...'
    : entry.notes

  return (
    <Link href={`/property/${property.id}`} className="block">
      <div className="bg-surface border border-border rounded p-4 hover:border-surface-elevated transition-colors flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-body font-semibold text-[14px] text-text-primary line-clamp-1">{property.address}</h3>
          <p className="text-[12px] text-text-muted line-clamp-1">{property.city}, {property.zip_code}</p>
        </div>

        <div className="flex justify-between items-center">
          <span className="font-data text-[13px] text-text-primary">{formatCurrency(property.county_appraisal)}</span>
          <span className="text-[12px] text-text-secondary">{timeInStage(entry.stage_changed_at)} in stage</span>
        </div>

        {property.sale_date && (
          <div className={clsx(
            "font-data text-[12px] flex items-center gap-2 flex-wrap",
            urgency === 'danger' && "text-danger",
            urgency === 'warning' && "text-warning",
            urgency === 'normal' && "text-text-secondary"
          )}>
            {urgency === 'danger' && (
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-danger" />
              </span>
            )}
            {urgency === 'warning' && (
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
            )}
            <span>Sale: {formatDate(property.sale_date)}</span>
          </div>
        )}

        {notesPreview && (
          <div className="mt-1 text-[12px] text-text-secondary italic line-clamp-2">
            &quot;{notesPreview}&quot;
          </div>
        )}
      </div>
    </Link>
  )
}