import { formatDistanceToNow } from 'date-fns'
import type { DealRoomActivityEntry } from '@/lib/queries'
import { Activity, ArrowRightCircle, FileCheck, DollarSign } from 'lucide-react'
import clsx from 'clsx'

interface ActivityFeedProps {
  activity: DealRoomActivityEntry[]
}

const STAGE_ICONS: Record<string, React.ReactNode> = {
  watching: <Activity className="w-4 h-4" />,
  offer_submitted: <DollarSign className="w-4 h-4" />,
  offer_accepted: <FileCheck className="w-4 h-4" />,
}

const STAGE_COLORS: Record<string, string> = {
  watching: 'text-indigo bg-indigo/10',
  researching: 'text-ink-500 bg-ink-100',
  site_visit: 'text-ink-500 bg-ink-100',
  preparing_offer: 'text-warning bg-warning/10',
  offer_submitted: 'text-accent bg-accent/10',
  counter_offered: 'text-warning bg-warning/10',
  offer_accepted: 'text-success bg-success/10',
  in_closing: 'text-success bg-success/10',
  closed: 'text-success bg-success/10',
  rejected: 'text-danger bg-danger/10',
  no_response: 'text-ink-400 bg-ink-100',
  passed: 'text-ink-400 bg-ink-100',
}

export function ActivityFeed({ activity }: ActivityFeedProps) {
  if (!activity || activity.length === 0) {
    return (
      <div className="zen-card p-12 text-center">
        <div className="w-16 h-16 bg-rice-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Activity className="w-8 h-8 text-ink-400" />
        </div>
        <h3 className="font-semibold text-lg text-foreground mb-2">No activity yet</h3>
        <p className="text-sm text-ink-500">
          Investor activity will appear here once they start saving properties.
        </p>
      </div>
    )
  }

  return (
    <div className="zen-card divide-y divide-border">
      {activity.map((entry) => {
        const investor = entry.profiles?.full_name || 'An investor'
        const address = entry.properties?.address || 'a property'
        const stageColor = STAGE_COLORS[entry.stage || ''] || 'text-ink-500 bg-ink-100'
        const stageLabel = entry.stage?.replace(/_/g, ' ') || 'updated'

        return (
          <div 
            key={entry.id} 
            className="flex items-start gap-4 p-5 hover:bg-rice-50/50 transition-colors"
          >
            {/* Stage icon */}
            <div className={clsx(
              'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
              stageColor
            )}>
              {STAGE_ICONS[entry.stage || ''] || <ArrowRightCircle className="w-4 h-4" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-semibold">{investor}</span>
                {' '}
                {entry.stage === 'watching' ? 'saved' : 'moved'}
                {' '}
                <span className="font-medium">{address}</span>
                {' '}
                {entry.stage !== 'watching' && (
                  <>
                    to <span className={clsx('font-semibold', stageColor.split(' ')[0])}>{stageLabel}</span>
                  </>
                )}
              </p>
              
              {entry.offer_amount && (
                <p className="text-sm text-ink-500 mt-1">
                  Offer: <span className="font-mono font-semibold text-accent">${entry.offer_amount.toLocaleString()}</span>
                </p>
              )}
              
              <p className="text-xs text-ink-400 mt-2">
                {entry.updated_at ? formatDistanceToNow(new Date(entry.updated_at), { addSuffix: true }) : ''}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
