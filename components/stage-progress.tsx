import type { PipelineStage } from '@/lib/types'
import clsx from 'clsx'

const STAGES: PipelineStage[] = [
  'watching',
  'researching',
  'site_visit',
  'preparing_offer',
  'offer_submitted',
  'counter_offered',
  'offer_accepted',
  'in_closing',
  'closed',
  'rejected',
  'no_response',
  'passed',
]

const LABELS: Record<PipelineStage, string> = {
  watching: 'Watching',
  researching: 'Researching',
  site_visit: 'Site Visit',
  preparing_offer: 'Preparing Offer',
  offer_submitted: 'Offer Submitted',
  counter_offered: 'Counter-Offered',
  offer_accepted: 'Offer Accepted',
  in_closing: 'In Closing',
  closed: 'Closed',
  rejected: 'Rejected',
  no_response: 'No Response',
  passed: 'Passed',
}

interface StageProgressProps {
  currentStage: PipelineStage
}

export function StageProgress({ currentStage }: StageProgressProps) {
  const currentIndex = STAGES.indexOf(currentStage)

  return (
    <ol className="space-y-2">
      {STAGES.map((stage, index) => {
        const isCurrent = stage === currentStage
        const isComplete = index < currentIndex

        return (
          <li
            key={stage}
            className={clsx(
              'rounded-card border px-3 py-2 text-xs uppercase tracking-[0.08em]',
              isCurrent
                ? 'border-accent bg-accent/20 text-accent'
                : isComplete
                  ? 'border-success/40 bg-success/10 text-success'
                  : 'border-border text-text-muted'
            )}
          >
            {LABELS[stage]}
          </li>
        )
      })}
    </ol>
  )
}
