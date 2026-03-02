import clsx from 'clsx'

export function StageBadge({ stage }: { stage: string | null }) {
  if (!stage) return null
  
  const formatStage = (s: string) => {
    switch (s) {
      case 'new_filing': return 'NEW FILING'
      case 'sale_date_assigned': return 'SALE DATE SET'
      case 'upcoming': return 'AUCTION SCHEDULED'
      case 'sold': return 'SOLD'
      case 'redeemed': return 'REDEEMED'
      case 'canceled': return 'CANCELED'
      default: return s.replace(/_/g, ' ').toUpperCase()
    }
  }

  const getStageColor = (s: string) => {
    switch (s) {
      case 'new_filing': return 'bg-info/10 text-info border-info/20'
      case 'sale_date_assigned': return 'bg-warning/10 text-warning border-warning/20'
      case 'upcoming': return 'bg-danger/10 text-danger border-danger/20'
      case 'sold': 
      case 'redeemed': return 'bg-success/10 text-success border-success/20'
      default: return 'bg-text-muted/10 text-text-muted border-text-muted/20'
    }
  }

  return (
    <span className={clsx(
      "inline-block px-[8px] py-[3px] rounded-[2px] text-[10px] tracking-[0.08em] font-medium uppercase border",
      getStageColor(stage)
    )}>
      {formatStage(stage)}
    </span>
  )
}