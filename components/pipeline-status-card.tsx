"use client"

import { DealRoom, PipelineStage } from "@/lib/types"
import { Button } from "./ui/button"
import { saveToPipeline, changeStage } from "@/actions/pipeline"
import { useTransition } from "react"
import { Check, Mail, Phone } from "lucide-react"

const ALL_STAGES: { id: PipelineStage; label: string }[] = [
  { id: 'watching', label: 'Watching' },
  { id: 'researching', label: 'Researching' },
  { id: 'site_visit', label: 'Site Visit' },
  { id: 'preparing_offer', label: 'Preparing Offer' },
  { id: 'offer_submitted', label: 'Offer Submitted' },
  { id: 'counter_offered', label: 'Counter Offered' },
  { id: 'offer_accepted', label: 'Offer Accepted' },
  { id: 'in_closing', label: 'In Closing' },
  { id: 'closed', label: 'Closed' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'no_response', label: 'No Response' },
  { id: 'passed', label: 'Passed' },
]

export function PipelineStatusCard({
  propertyId,
  pipelineEntry,
  watchingCount,
  dealRoom,
}: {
  propertyId: string
  pipelineEntry: { id: string; stage: PipelineStage | null } | null
  watchingCount: number
  dealRoom: DealRoom | null
}) {
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    startTransition(async () => {
      await saveToPipeline(propertyId)
    })
  }

  const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (pipelineEntry) {
      startTransition(async () => {
        await changeStage(pipelineEntry.id, e.target.value)
      })
    }
  }

  const renderStages = () => {
    if (!pipelineEntry?.stage) return null
    
    const currentIndex = ALL_STAGES.findIndex(s => s.id === pipelineEntry.stage)
    
    return (
      <div className="mt-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Pipeline Progress</span>
          <select 
            value={pipelineEntry.stage} 
            onChange={handleStageChange}
            disabled={isPending}
            className="text-xs bg-background border border-border rounded-sharp px-2 py-1 focus:outline-none focus:ring-1 focus:ring-accent-pine"
          >
            {ALL_STAGES.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
        
        <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {ALL_STAGES.map((stage, index) => {
            const isCompleted = index < currentIndex
            const isCurrent = index === currentIndex
            const isFuture = index > currentIndex

            return (
              <div key={stage.id} className="relative flex items-center gap-3">
                <div className={`z-10 flex h-5 w-5 items-center justify-center rounded-full border ${
                  isCurrent ? 'bg-accent-pine border-accent-pine text-white' : 
                  isCompleted ? 'bg-accent-pine/20 border-accent-pine text-accent-pine' : 
                  'bg-surface-1 border-border text-muted'
                }`}>
                  {isCompleted ? <Check className="h-3 w-3" /> : <div className={`h-1.5 w-1.5 rounded-full ${isCurrent ? 'bg-white' : 'bg-transparent'}`} />}
                </div>
                <span className={`text-sm ${isCurrent ? 'font-semibold text-foreground' : isCompleted ? 'text-foreground' : 'text-muted'}`}>
                  {stage.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-sharp border border-border bg-surface-1 p-6">
        <h2 className="font-serif text-xl font-semibold mb-6 border-b border-border pb-4">Pipeline Status</h2>
        
        {!pipelineEntry ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted mb-4">This property is not in your pipeline.</p>
            <Button onClick={handleSave} disabled={isPending} className="w-full">
              {isPending ? 'Saving...' : 'Add to Pipeline'}
            </Button>
          </div>
        ) : (
          renderStages()
        )}
      </div>

      {watchingCount > 1 && (
        <div className="rounded-sharp border border-border bg-surface-1 p-6">
          <p className="text-sm font-medium text-center">
            <span className="font-mono text-lg font-bold text-accent-pine mr-2">{watchingCount}</span>
            investors are watching this property
          </p>
        </div>
      )}

      {dealRoom && (dealRoom.contact_email || dealRoom.contact_phone) && (
        <div className="rounded-sharp border border-border bg-surface-1 p-6">
          <h2 className="font-serif text-lg font-semibold mb-4 border-b border-border pb-3">Agent Contact</h2>
          <div className="space-y-3">
            <p className="font-medium text-sm">{dealRoom.name}</p>
            {dealRoom.contact_email && (
              <a href={`mailto:${dealRoom.contact_email}`} className="flex items-center gap-2 text-sm text-muted hover:text-accent-pine transition-colors">
                <Mail className="h-4 w-4" />
                {dealRoom.contact_email}
              </a>
            )}
            {dealRoom.contact_phone && (
              <a href={`tel:${dealRoom.contact_phone}`} className="flex items-center gap-2 text-sm text-muted hover:text-accent-pine transition-colors">
                <Phone className="h-4 w-4" />
                {dealRoom.contact_phone}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
