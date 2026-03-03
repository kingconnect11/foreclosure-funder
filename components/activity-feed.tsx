import { DealRoomActivityEntry } from "@/lib/queries"
import { formatDistanceToNow } from "date-fns"
import { Activity } from "lucide-react"

export function ActivityFeed({ activities }: { activities: DealRoomActivityEntry[] }) {
  if (activities.length === 0) {
    return (
      <div className="rounded-sharp border border-dashed border-border bg-surface-1/50 p-12 text-center flex flex-col items-center">
        <div className="h-12 w-12 rounded-full bg-surface-2 flex items-center justify-center mb-4">
          <Activity className="h-6 w-6 text-muted" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">No activity yet</h3>
        <p className="text-sm text-muted max-w-sm">
          Investors will appear here once they start saving properties and moving them through the pipeline.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-sharp border border-border bg-surface-1">
      <div className="p-4 border-b border-border">
        <h2 className="font-serif text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-muted" />
          Recent Activity
        </h2>
      </div>
      <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
        {activities.map((activity) => {
          const investorName = activity.profiles?.full_name || "Unknown Investor"
          const address = activity.properties?.address || "Unknown Property"
          
          let message = ""
          if (activity.stage === 'watching') {
            message = `saved ${address} to pipeline`
          } else if (activity.offer_amount && activity.stage === 'offer_submitted') {
            message = `submitted offer on ${address} for $${activity.offer_amount.toLocaleString()}`
          } else {
            message = `moved ${address} to ${activity.stage?.replace('_', ' ')}`
          }

          return (
            <div key={activity.id} className="p-4 hover:bg-surface-2/30 transition-colors">
              <p className="text-sm text-foreground">
                <span className="font-semibold text-accent-pine">{investorName}</span> {message}
              </p>
              <p className="text-xs text-muted mt-1">
                {activity.updated_at ? formatDistanceToNow(new Date(activity.updated_at), { addSuffix: true }) : 'Recently'}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
