'use client'

import { PipelineStage, InvestorPipeline } from '@/lib/types'
import { saveToPipeline, changeStage, removeFromPipeline } from '@/actions/pipeline'
import { useEffect, useState } from 'react'
import { Check, ChevronRight, Trash2, Plus } from 'lucide-react'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'

const STAGES: { value: PipelineStage; label: string; description: string }[] = [
  { value: 'watching', label: 'Watching', description: 'Initial interest' },
  { value: 'researching', label: 'Researching', description: 'Due diligence' },
  { value: 'site_visit', label: 'Site Visit', description: 'Physical inspection' },
  { value: 'preparing_offer', label: 'Preparing Offer', description: 'Documentation ready' },
  { value: 'offer_submitted', label: 'Offer Submitted', description: 'Awaiting response' },
  { value: 'counter_offered', label: 'Counter Offered', description: 'Negotiation phase' },
  { value: 'offer_accepted', label: 'Offer Accepted', description: 'Deal in motion' },
  { value: 'in_closing', label: 'In Closing', description: 'Finalizing paperwork' },
  { value: 'closed', label: 'Closed', description: 'Transaction complete' },
  { value: 'rejected', label: 'Rejected', description: 'Offer declined' },
  { value: 'no_response', label: 'No Response', description: 'Awaiting contact' },
  { value: 'passed', label: 'Passed', description: 'Not pursuing' },
]

export function StageProgress({ 
  propertyId, 
  pipelineEntry 
}: { 
  propertyId: string
  pipelineEntry: InvestorPipeline | null 
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [currentStage, setCurrentStage] = useState<PipelineStage | null>(pipelineEntry?.stage ?? null)
  const router = useRouter()

  useEffect(() => {
    setCurrentStage(pipelineEntry?.stage ?? null)
  }, [pipelineEntry?.id, pipelineEntry?.stage])

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      await saveToPipeline(propertyId)
      router.refresh()
    } catch {
      // Error handled by action
    } finally {
      setIsSaving(false)
    }
  }

  const handleStageChange = async (newStage: PipelineStage) => {
    if (!pipelineEntry || isSaving) return
    const previousStage = currentStage
    setCurrentStage(newStage)
    setIsSaving(true)
    try {
      await changeStage(pipelineEntry.id, newStage)
      router.refresh()
    } catch {
      setCurrentStage(previousStage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemove = async () => {
    if (!pipelineEntry || isSaving) return
    setIsSaving(true)
    try {
      await removeFromPipeline(pipelineEntry.id)
      router.refresh()
    } finally {
      setIsSaving(false)
    }
  }

  if (!pipelineEntry) {
    return (
      <div className="zen-card p-6 text-center">
        <div className="w-12 h-12 bg-rice-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="w-6 h-6 text-ink-400" />
        </div>
        <h3 className="font-semibold text-lg text-foreground mb-2">Track this property</h3>
        <p className="text-sm text-ink-500 mb-5">
          Add to your pipeline to monitor progress and set reminders.
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

  const currentIndex = STAGES.findIndex((s) => s.value === currentStage)
  const activeStages = STAGES.slice(0, 9) // Main acquisition flow

  return (
    <div className="zen-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
        <div>
          <h3 className="font-semibold text-foreground">Pipeline Status</h3>
          <p className="text-xs text-ink-500 mt-0.5">
            Last updated {pipelineEntry.stage_changed_at ? 
              new Date(pipelineEntry.stage_changed_at).toLocaleDateString() : 'recently'}
          </p>
        </div>
        <select 
          className="input-zen text-sm py-1.5 w-[140px]"
          value={currentStage || ''}
          onChange={(e) => handleStageChange(e.target.value as PipelineStage)}
          disabled={isSaving}
        >
          {STAGES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Stage Timeline */}
      <div className="space-y-1">
        {activeStages.map((stage, index) => {
          const isCurrent = index === currentIndex
          const isPast = currentIndex > -1 && index < currentIndex
          const isFuture = currentIndex === -1 || index > currentIndex
          
          return (
            <div 
              key={stage.value} 
              className={clsx(
                'flex items-center gap-3 p-2 rounded-lg transition-colors',
                isCurrent && 'bg-accent/5',
                !isCurrent && 'hover:bg-rice-50'
              )}
            >
              {/* Status indicator */}
              <div className={clsx(
                'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
                isCurrent ? 'bg-accent text-white' : 
                isPast ? 'bg-success/20 text-success' : 
                'bg-rice-200 text-ink-400'
              )}>
                {isCurrent ? (
                  <div className="w-2 h-2 bg-white rounded-full" />
                ) : isPast ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </div>
              
              {/* Label */}
              <div className="flex-1 min-w-0">
                <p className={clsx(
                  'text-sm font-medium truncate',
                  isCurrent ? 'text-accent' : 
                  isPast ? 'text-foreground' : 
                  'text-ink-400'
                )}>
                  {stage.label}
                </p>
                <p className={clsx(
                  'text-xs truncate',
                  isCurrent ? 'text-accent/70' : 
                  isPast ? 'text-ink-500' : 
                  'text-ink-400'
                )}>
                  {stage.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Remove button */}
      <div className="mt-5 pt-4 border-t border-border">
        <button 
          onClick={handleRemove}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium 
                     text-ink-500 hover:text-danger hover:bg-danger/5 
                     rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Remove from Pipeline
        </button>
      </div>
    </div>
  )
}
