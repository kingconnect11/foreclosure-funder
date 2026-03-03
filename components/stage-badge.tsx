import clsx from 'clsx'

interface StageBadgeProps {
  stage: string | null
  size?: 'sm' | 'md' | 'lg'
}

export default function StageBadge({ stage, size = 'md' }: StageBadgeProps) {
  if (!stage) return null

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }

  const stageConfig: Record<string, { label: string; className: string; dotClass: string }> = {
    new_filing: {
      label: 'New Filing',
      className: 'bg-indigo/10 text-indigo border border-indigo/20',
      dotClass: 'bg-indigo',
    },
    sale_date_assigned: {
      label: 'Sale Date Set',
      className: 'bg-warning/10 text-warning-dark border border-warning/20',
      dotClass: 'bg-warning',
    },
    upcoming: {
      label: 'Auction Soon',
      className: 'bg-danger/10 text-danger border border-danger/20',
      dotClass: 'bg-danger',
    },
    sold: {
      label: 'Sold',
      className: 'bg-success/10 text-success border border-success/20',
      dotClass: 'bg-success',
    },
    redeemed: {
      label: 'Redeemed',
      className: 'bg-ink-100 text-ink-500 border border-ink-200',
      dotClass: 'bg-ink-400',
    },
    canceled: {
      label: 'Canceled',
      className: 'bg-ink-100 text-ink-500 border border-ink-200',
      dotClass: 'bg-ink-400',
    },
  }

  const config = stageConfig[stage] || {
    label: stage.replace(/_/g, ' '),
    className: 'bg-ink-100 text-ink-600 border border-ink-200',
    dotClass: 'bg-ink-400',
  }

  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 rounded-md font-semibold uppercase tracking-wider',
      sizeClasses[size],
      config.className
    )}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', config.dotClass)} />
      {config.label}
    </span>
  )
}
