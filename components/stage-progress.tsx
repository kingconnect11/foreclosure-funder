'use client'

import { PipelineStage, InvestorPipeline } from '@/lib/types'
import { saveToPipeline, changeStage, removeFromPipeline } from '@/actions/pipeline'
import { useState } from 'react'
import { Check } from 'lucide-react'
import clsx from 'clsx'

const STAGES: { value: PipelineStage; label: string }[] = [
  { value: 'watching', label: 'Watching' },
  { value: 'researching', label: 'Researching' },
  { value: 'site_visit', label: 'Site Visit' },
  { value: 'preparing_offer', label: 'Preparing Offer' },
  { value: 'offer_submitted', label: 'Offer Submitted' },
  { value: 'counter_offered', label: 'Counter Offered' },
  { value: 'offer_accepted', label: 'Offer Accepted' },
  { value: 'in_closing', label: 'In Closing' },
  { value: 'closed', label: 'Closed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'no_response', label: 'No Response' },
  { value: 'passed', label: 'Passed' },
]

export function StageProgress({ 
  propertyId, 
  pipelineEntry 
}: { 
  propertyId: string
  pipelineEntry: InvestorPipeline | null 
}) {
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      await saveToPipeline(propertyId)
    } finally {
      setIsSaving(false)
    }
  }

  const handleStageChange = async (newStage: PipelineStage) => {
    if (!pipelineEntry || isSaving) return
    setIsSaving(true)
    try {
      await changeStage(pipelineEntry.id, newStage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemove = async () => {
    if (!pipelineEntry || isSaving) return
    setIsSaving(true)
    try {
      await removeFromPipeline(pipelineEntry.id)
    } finally {
      setIsSaving(false)
    }
  }

  if (!pipelineEntry) {
    return (
      <div className="dossier-card text-center py-10 px-6">
        <h3 className="font-display text-2xl mb-2 text-text-primary">Not Tracking</h3>
        <p className="text-sm text-text-secondary mb-8 leading-relaxed">
          Add this property to your pipeline to track progress, add notes, and monitor updates.
        </p>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="btn-primary w-full"
        >
          {isSaving ? 'Adding...' : 'Add to Pipeline'}
        </button>
      </div>
    )
  }

  const currentIndex = STAGES.findIndex(s => s.value === pipelineEntry.stage)

  return (
    <div className="dossier-card flex flex-col p-6 relative">
      <div className="flex items-center justify-between mb-8 pb-4 ledger-divider">
        <h3 className="font-display text-2xl text-text-primary">Pipeline Status</h3>
        <select 
          className="bg-transparent border border-border rounded-sm px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-text-primary focus:border-accent focus:outline-none transition-colors w-[160px]"
          value={pipelineEntry.stage || ''}
          onChange={(e) => handleStageChange(e.target.value as PipelineStage)}
          disabled={isSaving}
        >
          {STAGES.map(s => (
            <option key={s.value} value={s.value} className="bg-surface">{s.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col relative px-2">
        <div className="absolute left-[17px] top-3 bottom-5 w-px bg-border border-dashed z-0" />
        
        {STAGES.map((stage, index) => {
          const isCurrent = index === currentIndex
          const isPast = currentIndex > -1 && index < currentIndex
          
          return (
            <div key={stage.value} className="flex items-start gap-5 relative z-10 py-2.5">
              <div className={clsx(
                "w-5 h-5 rounded-sm flex items-center justify-center shrink-0 mt-0.5 border transition-colors",
                isCurrent ? "bg-accent border-accent text-[#0A0A0C]" : 
                isPast ? "bg-surface-elevated border-text-muted text-text-secondary" : 
                "bg-surface border-border text-transparent"
              )}>
                {isCurrent && <span className="w-2 h-2 bg-[#0A0A0C] rounded-sm" />}
                {isPast && <Check size={12} strokeWidth={3} />}
              </div>
              
              <div className="flex flex-col">
                <span className={clsx(
                  "text-sm font-semibold uppercase tracking-wider transition-colors",
                  isCurrent ? "text-accent" : 
                  isPast ? "text-text-primary" : 
                  "text-text-muted"
                )}>
                  {stage.label}
                </span>
                {isCurrent && pipelineEntry.stage_changed_at && (
                  <span className="text-xs font-data text-text-muted mt-1">
                    Updated {new Date(pipelineEntry.stage_changed_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="pt-6 mt-6 ledger-divider border-t">
        <button 
          onClick={handleRemove}
          disabled={isSaving}
          className="text-xs font-semibold uppercase tracking-widest text-danger hover:text-danger/80 transition-colors w-full text-center"
        >
          Remove from Pipeline
        </button>
      </div>
    </div>
  )
}
