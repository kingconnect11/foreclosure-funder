import Link from 'next/link'
import { InvestorPipeline, Property } from '@/lib/types'
import { formatCurrency, formatDate, saleDateUrgency, timeInStage } from '@/lib/utils'
import { Clock, MapPin, FileText } from 'lucide-react'
import clsx from 'clsx'

export type PipelineEntryWithProperty = InvestorPipeline & {
  properties: Property
}

export function PipelineCard({ entry }: { entry: PipelineEntryWithProperty }) {
  const property = entry.properties
  const urgency = saleDateUrgency(property.sale_date)
  
  const notesPreview = entry.notes 
    ? (entry.notes.length > 60 ? entry.notes.substring(0, 60) + '...' : entry.notes)
    : null

  return (
    <Link href={`/property/${property.id}`} className="block group">
      <div className="zen-card-interactive p-4">
        {/* Address */}
        <h4 className="font-semibold text-foreground leading-tight mb-1 group-hover:text-accent transition-colors">
          {property.address}
        </h4>
        <p className="text-xs text-ink-500 flex items-center gap-1 mb-3">
          <MapPin className="w-3 h-3" />
          {property.city}, {property.zip_code}
        </p>

        {/* Financial info */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-ink-500">Appraisal</span>
          <span className="font-mono font-semibold text-sm text-foreground">
            {formatCurrency(property.county_appraisal)}
          </span>
        </div>

        {/* Sale date with urgency */}
        {property.sale_date && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-ink-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Sale
            </span>
            <span className={clsx(
              'font-mono text-xs font-semibold',
              urgency === 'danger' ? 'text-danger' : 
              urgency === 'warning' ? 'text-warning-dark' : 'text-ink-600'
            )}>
              {formatDate(property.sale_date)}
            </span>
          </div>
        )}

        {/* Time in stage */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-xs text-ink-400">In stage</span>
          <span className="font-mono text-xs text-ink-600 bg-rice-100 px-2 py-0.5 rounded">
            {timeInStage(entry.stage_changed_at)}
          </span>
        </div>

        {/* Notes preview */}
        {notesPreview && (
          <div className="mt-3 pt-3 border-t border-border border-dashed">
            <p className="text-xs text-ink-500 flex items-start gap-1.5">
              <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span className="italic line-clamp-2">&ldquo;{notesPreview}&rdquo;</span>
            </p>
          </div>
        )}
      </div>
    </Link>
  )
}
