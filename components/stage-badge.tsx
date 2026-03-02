import clsx from 'clsx'

type StageProps = {
  stage: string | null | undefined
}

export function StageBadge({ stage }: StageProps) {
  if (!stage) return null

  let label = stage.replace(/_/g, ' ')
  let colorClass = 'bg-surface-elevated text-text-secondary border-border'

  if (stage === 'new_filing') {
    label = 'NEW FILING'
    colorClass = 'bg-info/10 text-info border-info/20'
  } else if (stage === 'sale_date_assigned') {
    label = 'SALE DATE SET'
    colorClass = 'bg-warning/10 text-warning border-warning/20'
  } else if (stage === 'upcoming') {
    label = 'AUCTION SCHEDULED'
    colorClass = 'bg-danger/10 text-danger border-danger/20'
  } else if (stage === 'sold' || stage === 'redeemed' || stage === 'canceled') {
    label = stage.toUpperCase()
    colorClass = 'bg-surface-elevated text-text-muted border-border'
  }

  return (
    <span className={clsx(
      'inline-block uppercase text-[10px] tracking-[0.08em] font-bold rounded-[2px] px-2 py-1 border',
      colorClass
    )}>
      {label}
    </span>
  )
}