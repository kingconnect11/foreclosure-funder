'use client'

import { InvestorPipeline, PipelineStage, PipelineStageHistory } from '@/lib/types'
import { saveToPipeline, changeStage } from '@/actions/pipeline'
import { useState } from 'react'
import clsx from 'clsx'

const STAGES: PipelineStage[] = [
  'watching', 'researching', 'site_visit', 'preparing_offer',
  'offer_submitted', 'counter_offered', 'offer_accepted',
  'in_closing', 'closed', 'rejected', 'no_response', 'passed'
]

const formatStage = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

function formatDate(ts: string | null): string {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getDurationDays(entered: string | null, exited: string | null): number | null {
  if (!entered || !exited) return null
  const ms = new Date(exited).getTime() - new Date(entered).getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

export function StageProgress({
  propertyId,
  pipelineEntry,
  stageHistory = [],
}: {
  propertyId: string
  pipelineEntry: InvestorPipeline | null
  stageHistory?: PipelineStageHistory[]
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [targetStage, setTargetStage] = useState<PipelineStage | null>(null)
  const [modalNotes, setModalNotes] = useState('')

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      await saveToPipeline(propertyId)
    } finally {
      setIsSaving(false)
    }
  }

  const openModal = (stage: PipelineStage) => {
    setTargetStage(stage)
    setModalNotes('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setTargetStage(null)
    setModalNotes('')
  }

  const confirmStageChange = async () => {
    if (!pipelineEntry || !targetStage || isSaving) return
    setIsSaving(true)
    try {
      await changeStage(pipelineEntry.id, targetStage, modalNotes.trim() || undefined)
      closeModal()
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
          {isSaving ? 'Saving...' : 'Add to Pipeline'}
        </button>
      </div>
    )
  }

  const currentIndex = STAGES.indexOf(pipelineEntry.stage as PipelineStage)

  return (
    <>
      <div className="bg-surface border border-border rounded p-5 flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <label className="text-[12px] font-medium uppercase tracking-[0.05em] text-text-secondary">
            Current Stage
          </label>

          <div className="flex flex-col gap-1">
            {STAGES.map((stage, idx) => {
              const isCurrent = idx === currentIndex
              const isPast = idx < currentIndex

              return (
                <button
                  key={stage}
                  onClick={() => openModal(stage)}
                  disabled={isSaving}
                  className={clsx(
                    'flex items-center gap-3 w-full text-left rounded px-2 py-1.5 transition-colors',
                    isCurrent
                      ? 'bg-accent/10 hover:bg-accent/20'
                      : 'hover:bg-surface-elevated'
                  )}
                >
                  <div className={clsx(
                    'w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 border',
                    isCurrent ? 'bg-accent border-accent text-[#0B1928]' :
                    isPast ? 'bg-transparent border-text-secondary text-text-secondary' :
                    'bg-transparent border-border'
                  )}>
                    {isPast && <span className="text-[10px]">✓</span>}
                    {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-[#0B1928]" />}
                  </div>
                  <span className={clsx(
                    'text-sm',
                    isCurrent ? 'text-accent font-semibold' :
                    isPast ? 'text-text-secondary' :
                    'text-text-muted'
                  )}>
                    {formatStage(stage)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {stageHistory.length > 0 && (
          <div className="flex flex-col gap-0 border-t border-border pt-4">
            <span className="text-[12px] font-medium uppercase tracking-[0.05em] text-text-muted mb-3">
              Stage History
            </span>
            {stageHistory.map((entry, idx) => {
              const days = getDurationDays(entry.entered_at, entry.exited_at)
              return (
                <div key={entry.id} className="flex gap-3 pb-4 relative">
                  {idx < stageHistory.length - 1 && (
                    <div className="absolute left-[7px] top-4 bottom-0 w-px bg-border" />
                  )}
                  <div className="w-4 h-4 rounded-full bg-accent/20 border border-accent flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-medium text-text-primary">
                        {formatStage(entry.stage)}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        {formatDate(entry.entered_at)}
                      </span>
                      {days !== null && (
                        <span className="text-[11px] text-text-muted">
                          · {days} {days === 1 ? 'day' : 'days'}
                        </span>
                      )}
                    </div>
                    {entry.notes && (
                      <p className="text-[13px] text-text-secondary leading-relaxed">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showModal && targetStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-surface border border-border rounded-lg p-6 w-full max-w-md mx-4 flex flex-col gap-4">
            <h3 className="text-[18px] font-display font-semibold text-text-primary">
              Move to {formatStage(targetStage)}?
            </h3>
            <textarea
              placeholder="Add notes for this stage transition (optional)"
              value={modalNotes}
              onChange={e => setModalNotes(e.target.value)}
              rows={3}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent resize-none"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeModal}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary border border-border rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmStageChange}
                disabled={isSaving}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-[#0B1928] rounded text-sm font-medium transition-colors disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
