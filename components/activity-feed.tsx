import { formatDistanceToNow } from 'date-fns'
import { Activity } from 'lucide-react'

export function ActivityFeed({ activity }: { activity: any[] }) {
  if (!activity || activity.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 bg-surface border border-border rounded p-6">
        <Activity className="w-8 h-8 text-text-muted" />
        <p className="text-text-muted text-sm text-center">
          No activity yet. Investors will appear here once they start saving properties.
        </p>
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
          <li key={entry.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 flex-wrap">
            <span className="text-sm text-text-secondary min-w-0 break-words">{formatAction(entry)}</span>
            <span className="text-[12px] text-text-muted whitespace-nowrap shrink-0">
              {entry.updated_at ? formatDistanceToNow(new Date(entry.updated_at), { addSuffix: true }) : ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}