import { formatDistanceToNow } from 'date-fns'

export function ActivityFeed({ activity }: { activity: any[] }) {
  if (!activity || activity.length === 0) {
    return (
      <div className="dossier-card p-10 text-center text-text-muted text-sm">
        No recent activity found on the ledger.
      </div>
    )
  }

  const formatAction = (entry: any) => {
    const investor = entry.profiles?.full_name || 'An investor'
    const address = entry.properties?.address || 'a property'

    if (entry.stage === 'watching') {
      return (
        <>
          <span className="font-semibold text-text-primary">{investor}</span> appended <span className="font-medium text-text-primary">{address}</span> to their pipeline
        </>
      )
    }

    if (entry.stage === 'offer_submitted' && entry.offer_amount) {
      return (
        <>
          <span className="font-semibold text-text-primary">{investor}</span> submitted an offer on <span className="font-medium text-text-primary">{address}</span> for <span className="font-data text-accent">${entry.offer_amount.toLocaleString()}</span>
        </>
      )
    }

    return (
      <>
        <span className="font-semibold text-text-primary">{investor}</span> transitioned <span className="font-medium text-text-primary">{address}</span> to <span className="uppercase text-xs tracking-wider font-semibold text-accent">{entry.stage?.replace(/_/g, ' ')}</span>
      </>
    )
  }

  return (
    <div className="dossier-card">
      <ul className="flex flex-col divide-y divide-border border-b border-transparent">
        {activity.map((entry) => (
          <li key={entry.id} className="px-6 py-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 group hover:bg-surface-elevated/30 transition-colors">
            <span className="text-sm text-text-secondary leading-relaxed">{formatAction(entry)}</span>
            <span className="text-[11px] font-data text-text-muted whitespace-nowrap uppercase tracking-wider">
              {entry.updated_at ? formatDistanceToNow(new Date(entry.updated_at), { addSuffix: true }) : ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
