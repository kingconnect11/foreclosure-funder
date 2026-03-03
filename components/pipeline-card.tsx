import { PipelineEntryWithProperty } from "@/lib/queries"
import { formatCurrency, saleDateUrgency, formatDate, timeInStage } from "@/lib/utils"
import Link from "next/link"

export function PipelineCard({ entry }: { entry: PipelineEntryWithProperty }) {
  const property = entry.properties
  const urgency = saleDateUrgency(property.sale_date)
  
  return (
    <Link 
      href={`/property/${property.id}`}
      className="block rounded-sharp border border-border bg-surface-1 p-4 hover:border-accent-pine/50 transition-colors"
    >
      <h4 className="font-serif font-semibold text-foreground mb-1 truncate">{property.address}</h4>
      <p className="text-xs text-muted mb-3">{property.city}, {property.zip_code}</p>
      
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <p className="text-[10px] text-muted uppercase tracking-wider">Appraisal</p>
          <p className="font-mono text-sm">{formatCurrency(property.county_appraisal)}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted uppercase tracking-wider">Sale Date</p>
          <p className={`font-mono text-sm truncate ${urgency === 'danger' ? 'text-danger' : urgency === 'warning' ? 'text-warning' : 'text-foreground'}`}>
            {formatDate(property.sale_date)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <span className="text-xs text-muted">
          In stage: {timeInStage(entry.stage_changed_at)}
        </span>
      </div>
      
      {entry.notes && (
        <div className="mt-3 text-xs text-muted bg-surface-2 p-2 rounded-sharp border border-border line-clamp-2">
          {entry.notes}
        </div>
      )}
    </Link>
  )
}
