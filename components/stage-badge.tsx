import type { PropertyStage } from '@/lib/types'
import clsx from 'clsx'

interface StageBadgeProps {
  stage: PropertyStage | null
}

const LABELS: Record<PropertyStage, string> = {
  new_filing: 'NEW FILING',
  sale_date_assigned: 'SALE DATE SET',
  upcoming: 'AUCTION SCHEDULED',
  sold: 'SOLD',
  redeemed: 'REDEEMED',
  canceled: 'CANCELED',
}

const COLORS: Record<PropertyStage, string> = {
  new_filing: 'bg-info/20 text-info border-info/40',
  sale_date_assigned: 'bg-warning/20 text-warning border-warning/40',
  upcoming: 'bg-danger/20 text-danger border-danger/40',
  sold: 'bg-text-muted/20 text-text-muted border-text-muted/40',
  redeemed: 'bg-text-muted/20 text-text-muted border-text-muted/40',
  canceled: 'bg-text-muted/20 text-text-muted border-text-muted/40',
}

export function StageBadge({ stage }: StageBadgeProps) {
  if (!stage) return null

  return (
    <span
      className={clsx(
        'inline-flex w-fit items-center rounded-badge border px-2 py-1 text-[10px] font-medium uppercase tracking-[0.08em]',
        COLORS[stage]
      )}
    >
      {LABELS[stage]}
    </span>
  )
}
