'use client'

import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'

const ALL_STAGES = [
  'watching', 'researching', 'site_visit', 'preparing_offer',
  'offer_submitted', 'counter_offered', 'offer_accepted',
  'in_closing', 'closed', 'rejected', 'no_response', 'passed'
]

const formatStageLabel = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

export function ActivityFeed({ activity }: { activity: any[] }) {
  const [stageFilter, setStageFilter] = useState<string>('all')

  if (!activity || activity.length === 0) {
    return (
      <div className="bg-surface border border-border rounded p-6 text-center text-text-muted text-sm">
        No recent activity found.
      </div>
    )
  }

  const filtered = stageFilter === 'all'
    ? activity
    : activity.filter(e => e.stage === stageFilter)

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
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <label className="text-[12px] font-medium uppercase tracking-[0.05em] text-text-muted whitespace-nowrap">
          Filter by stage:
        </label>
        <select
          value={stageFilter}
          onChange={e => setStageFilter(e.target.value)}
          className="bg-background border border-border rounded px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent"
        >
          <option value="all">All Stages</option>
          {ALL_STAGES.map(stage => (
            <option key={stage} value={stage}>{formatStageLabel(stage)}</option>
          ))}
        </select>
      </div>

      <div className="bg-surface border border-border rounded p-1">
        {filtered.length === 0 ? (
          <div className="px-5 py-6 text-center text-text-muted text-sm">
            No activity for this stage.
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {filtered.map((entry) => (
              <li key={entry.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-sm text-text-secondary">{formatAction(entry)}</span>
                <span className="text-[12px] text-text-muted whitespace-nowrap">
                  {entry.updated_at ? formatDistanceToNow(new Date(entry.updated_at), { addSuffix: true }) : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
