'use client'

import { PipelineStage, InvestorPipeline } from '@/lib/types'
import { saveToPipeline, changeStage, removeFromPipeline } from '@/actions/pipeline'
import { useState } from 'react'
import { Check, ChevronRight } from 'lucide-react'
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
      <div className="card text-center py-8">
        <h3 className="font-display text-[20px] mb-2 text-text-primary">Not Tracking</h3>
        <p className="text-sm text-text-secondary mb-6">
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
    <div className="card flex flex-col gap-6 relative">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-[20px] text-text-primary">Pipeline Status</h3>
        <select 
          className="bg-surface-elevated border border-border rounded px-3 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent w-[180px]"
          value={pipelineEntry.stage || ''}
          onChange={(e) => handleStageChange(e.target.value as PipelineStage)}
          disabled={isSaving}
        >
          {STAGES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col relative">
        {/* Vertical line connecting nodes */}
        <div className="absolute left-[11px] top-3 bottom-5 w-[2px] bg-border z-0" />
        
        {STAGES.map((stage, index) => {
          const isCurrent = index === currentIndex
          const isPast = currentIndex > -1 && index < currentIndex
          
          return (
            <div key={stage.value} className="flex items-start gap-4 relative z-10 py-2">
              <div className={clsx(
                "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2 transition-colors",
                isCurrent ? "bg-accent border-accent text-[#040B14] shadow-glow" : 
                isPast ? "bg-surface-elevated border-text-secondary text-text-secondary" : 
                "bg-surface border-border text-transparent"
              )}>
                {isCurrent && <span className="w-2 h-2 rounded-full bg-[#040B14]" />}
                {isPast && <Check size={12} strokeWidth={3} />}
              </div>
              
              <div className="flex flex-col">
                <span className={clsx(
                  "text-[14px] font-medium transition-colors",
                  isCurrent ? "text-accent font-bold" : 
                  isPast ? "text-text-primary" : 
                  "text-text-muted"
                )}>
                  {stage.label}
                </span>
                {isCurrent && pipelineEntry.stage_changed_at && (
                  <span className="text-[12px] text-text-muted mt-0.5">
                    Updated {new Date(pipelineEntry.stage_changed_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="pt-4 border-t border-border mt-2">
        <button 
          onClick={handleRemove}
          disabled={isSaving}
          className="text-sm text-danger hover:text-danger/80 transition-colors w-full text-center"
        >
          Remove from Pipeline
        </button>
      </div>
    </div>
  )
}