import { formatDistanceToNow } from 'date-fns'

export function ActivityFeed({ activity }: { activity: any[] }) {
  if (!activity || activity.length === 0) {
    return (
      <div className="bg-surface border border-border rounded p-6 text-center text-text-muted text-sm">
        No recent activity found.
      </div>
    )
  }

  const formatAction = (entry: any) => {
    const investor = entry.profiles?.full_name || 'Someone'
    const address = entry.properties?.address || 'a property'

    if (entry.stage === 'watching') {
      return (
        <>
          <span className="font-medium text-text-primary">{investor}</span> saved <span className="font-medium text-text-primary">{address}</span> to pipeline
        </>
      )
    }

    if (entry.stage === 'offer_submitted' && entry.offer_amount) {
      return (
        <>
          <span className="font-medium text-text-primary">{investor}</span> submitted offer on <span className="font-medium text-text-primary">{address}</span> for <span className="font-data text-accent">${entry.offer_amount.toLocaleString()}</span>
        </>
      )
    }

    return (
      <>
        <span className="font-medium text-text-primary">{investor}</span> moved <span className="font-medium text-text-primary">{address}</span> to <span className="capitalize text-accent">{entry.stage?.replace(/_/g, ' ')}</span>
      </>
    )
  }

  return (
    <div className="bg-surface border border-border rounded p-1">
      <ul className="flex flex-col divide-y divide-border">
        {activity.map((entry) => (
          <li key={entry.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-sm text-text-secondary">{formatAction(entry)}</span>
            <span className="text-[12px] text-text-muted whitespace-nowrap">
              {entry.updated_at ? formatDistanceToNow(new Date(entry.updated_at), { addSuffix: true }) : ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}