import Link from 'next/link'
import type { PipelineEntryWithProperty } from '@/lib/queries'
import { formatCurrency, formatDate, saleDateUrgency, timeInStage } from '@/lib/utils'
import clsx from 'clsx'

interface PipelineCardProps {
  entry: PipelineEntryWithProperty
}

export function PipelineCard({ entry }: PipelineCardProps) {
  const property = entry.properties
  const urgency = saleDateUrgency(property.sale_date)

  return (
    <Link
      href={`/property/${property.id}`}
      className="block rounded-card border border-border bg-surface p-4 transition hover:border-surface-elevated"
    >
      <h3 className="mb-1 text-sm font-semibold text-text-primary">
        {property.address ?? '--'}
      </h3>
      <p className="mb-3 text-xs text-text-muted">
        {[property.city, property.zip_code].filter(Boolean).join(', ')}
      </p>

      <dl className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-[11px] uppercase tracking-[0.08em] text-text-muted">Appraisal</dt>
          <dd className="font-data text-[13px] text-text-primary">
            {formatCurrency(property.county_appraisal)}
          </dd>
        </div>
        {property.sale_date && (
          <div className="flex items-center justify-between gap-2">
            <dt className="text-[11px] uppercase tracking-[0.08em] text-text-muted">Sale Date</dt>
            <dd
              className={clsx(
                'font-data text-[13px]',
                urgency === 'danger'
                  ? 'text-danger'
                  : urgency === 'warning'
                    ? 'text-warning'
                    : 'text-text-secondary'
              )}
            >
              {formatDate(property.sale_date)}
            </dd>
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          <dt className="text-[11px] uppercase tracking-[0.08em] text-text-muted">
            Time in Stage
          </dt>
          <dd className="font-data text-[13px] text-text-secondary">
            {timeInStage(entry.stage_changed_at)}
          </dd>
        </div>
      </dl>

      {entry.notes && (
        <p className="mt-3 border-t border-border pt-3 text-xs text-text-secondary">
          {entry.notes.slice(0, 60)}
          {entry.notes.length > 60 ? '...' : ''}
        </p>
      )}
    </Link>
  )
}
