import { PipelineEntryWithProperty } from "@/lib/queries"
import { PipelineCard } from "./pipeline-card"

const STAGE_LABELS: Record<string, string> = {
  watching: 'Watching',
  researching: 'Researching',
  site_visit: 'Site Visit',
  preparing_offer: 'Preparing Offer',
  offer_submitted: 'Offer Submitted',
  counter_offered: 'Counter Offered',
  offer_accepted: 'Offer Accepted',
  in_closing: 'In Closing',
  closed: 'Closed',
  rejected: 'Rejected',
  no_response: 'No Response',
  passed: 'Passed',
}

// Order matters for Kanban
const STAGE_ORDER = [
  'watching', 'researching', 'site_visit', 'preparing_offer', 
  'offer_submitted', 'counter_offered', 'offer_accepted', 
  'in_closing', 'closed', 'rejected', 'no_response', 'passed'
]

export function KanbanBoard({ stages }: { stages: Record<string, PipelineEntryWithProperty[]> }) {
  // Only show columns that have entries
  const activeStages = STAGE_ORDER.filter(stage => stages[stage] && stages[stage].length > 0)

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 snap-x">
      {activeStages.map(stage => (
        <div key={stage} className="flex flex-col w-80 shrink-0 snap-start">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider">
              {STAGE_LABELS[stage] || stage}
            </h3>
            <span className="bg-surface-2 text-muted text-xs px-2 py-0.5 rounded-full font-medium">
              {stages[stage].length}
            </span>
          </div>
          
          <div className="flex flex-col gap-3">
            {stages[stage].map(entry => (
              <PipelineCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
