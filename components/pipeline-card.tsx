import Link from 'next/link'
import { InvestorPipeline, Property } from '@/lib/types'
import { formatCurrency, formatDate, saleDateUrgency, timeInStage } from '@/lib/utils'

export type PipelineEntryWithProperty = InvestorPipeline & {
  properties: Property
}

export function PipelineCard({ entry }: { entry: PipelineEntryWithProperty }) {
  const property = entry.properties
  const urgency = saleDateUrgency(property.sale_date)
  
  // Truncate notes if they exist
  const notesPreview = entry.notes 
    ? (entry.notes.length > 60 ? entry.notes.substring(0, 60) + '...' : entry.notes)
    : null

  return (
    <Link href={`/property/${property.id}`} className="block group">
      <div className="dossier-card bg-background hover:border-text-secondary transition-colors duration-300 p-4 flex flex-col gap-3">
        <div>
          <h4 className="font-display text-lg text-text-primary group-hover:text-accent transition-colors leading-tight mb-1">
            {property.address}
          </h4>
          <p className="text-xs text-text-secondary font-medium">
            {property.city}, {property.zip_code}
          </p>
        </div>
        
        <div className="flex flex-col gap-1.5 pt-2 border-t border-border border-dashed">
          <div className="flex justify-between items-baseline">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Appraisal</span>
            <span className="font-data text-xs text-text-primary">{formatCurrency(property.county_appraisal)}</span>
          </div>
          
          {property.sale_date && (
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Sale Date</span>
              <span className={`font-data text-xs ${urgency === 'danger' ? 'text-danger' : urgency === 'warning' ? 'text-warning' : 'text-text-primary'}`}>
                {formatDate(property.sale_date)}
              </span>
            </div>
          )}
          
          <div className="flex justify-between items-baseline mt-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Time in Stage</span>
            <span className="font-data text-[10px] text-text-secondary border border-border px-1.5 py-0.5 rounded-sm">
              {timeInStage(entry.stage_changed_at)}
            </span>
          </div>
        </div>

        {notesPreview && (
          <div className="pt-2 mt-1 border-t border-border border-dashed">
            <p className="text-[11px] text-text-muted italic line-clamp-2">
              "{notesPreview}"
            </p>
          </div>
        )}
      </div>
    </Link>
  )
}
