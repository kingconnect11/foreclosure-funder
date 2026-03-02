'use client'

import { InvestorPipeline, PipelineStage } from '@/lib/types'
import { saveToPipeline, changeStage } from '@/actions/pipeline'
import { useState } from 'react'
import clsx from 'clsx'

const STAGES: PipelineStage[] = [
  'watching', 'researching', 'site_visit', 'preparing_offer', 
  'offer_submitted', 'counter_offered', 'offer_accepted', 
  'in_closing', 'closed', 'rejected', 'no_response', 'passed'
]

const formatStage = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

export function StageProgress({ 
  propertyId, 
  pipelineEntry 
}: { 
  propertyId: string, 
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

  const handleStageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!pipelineEntry || isSaving) return
    setIsSaving(true)
    try {
      await changeStage(pipelineEntry.id, e.target.value)
    } finally {
      setIsSaving(false)
    }
  }

  if (!pipelineEntry) {
    return (
      <div className="bg-surface border border-border rounded p-5">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-accent hover:bg-accent-hover text-[#0B1928] font-semibold text-sm rounded py-2.5 transition-colors"
        >
          {isSaving ? "Saving..." : "Add to Pipeline"}
        </button>
      </div>
    )
  }

  const currentIndex = STAGES.indexOf(pipelineEntry.stage as PipelineStage)

  return (
    <div className="bg-surface border border-border rounded p-5 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-[12px] font-medium uppercase tracking-[0.05em] text-text-secondary">
          Current Stage
        </label>
        <select 
          value={pipelineEntry.stage ?? 'watching'}
          onChange={handleStageChange}
          disabled={isSaving}
          className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
        >
          {STAGES.map(stage => (
            <option key={stage} value={stage}>{formatStage(stage)}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3">
        {STAGES.map((stage, idx) => {
          const isCurrent = idx === currentIndex
          const isPast = idx < currentIndex

          return (
            <div key={stage} className="flex items-center gap-3">
              <div className={clsx(
                "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 border",
                isCurrent ? "bg-accent border-accent text-[#0B1928]" :
                isPast ? "bg-transparent border-text-secondary text-text-secondary" :
                "bg-transparent border-border"
              )}>
                {isPast && <span className="text-[10px]">✓</span>}
                {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-[#0B1928]"></span>}
              </div>
              <span className={clsx(
                "text-sm",
                isCurrent ? "text-accent font-semibold" :
                isPast ? "text-text-secondary" :
                "text-text-muted"
              )}>
                {formatStage(stage)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}