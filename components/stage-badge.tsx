import clsx from 'clsx'

type Stage = 'new_filing' | 'sale_date_assigned' | 'upcoming' | 'sold' | 'redeemed' | 'canceled'

interface StageBadgeProps {
  stage: string | null
  className?: string
}

export default function StageBadge({ stage, className }: StageBadgeProps) {
  if (!stage) return null
  let label = stage.replace(/_/g, ' ')
  let colorClass = 'bg-surface-elevated text-text-secondary border-border'
  let dotClass = 'bg-text-muted'

  switch (stage) {
    case 'new_filing':
      label = 'New Filing'
      colorClass = 'bg-info/10 text-info border-info/20'
      dotClass = 'bg-info'
      break
    case 'sale_date_assigned':
      label = 'Sale Date Set'
      colorClass = 'bg-warning/10 text-warning border-warning/20'
      dotClass = 'bg-warning'
      break
    case 'upcoming':
      label = 'Auction Scheduled'
      colorClass = 'bg-danger/10 text-danger border-danger/20'
      dotClass = 'bg-danger'
      break
    case 'sold':
    case 'redeemed':
    case 'canceled':
      colorClass = 'bg-surface text-text-muted border-border'
      dotClass = 'bg-text-muted'
      break
  }

  return (
    <span className={clsx(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] font-medium uppercase tracking-[0.08em] border",
      colorClass,
      className
    )}>
      <span className={clsx("w-1.5 h-1.5 rounded-full", dotClass)}></span>
      {label}
    </span>
  )
}
