'use client'

import { InvestorPipeline, PipelineStage, PipelineStageHistory } from '@/lib/types'
import { saveToPipeline, changeStage } from '@/actions/pipeline'
import { useState } from 'react'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()

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
      router.refresh()
    } finally {
      setIsSaving(false)
    }
  }

  if (!pipelineEntry) {
    return (
      <div className="zen-card p-6 text-center">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary w-full"
        >
          {isSaving ? 'Saving...' : 'Add to Pipeline'}
        </button>
      </div>
    )
  }

  const currentIndex = pipelineEntry.stage ? STAGES.indexOf(pipelineEntry.stage) : -1

  return (
    <>
      <div className="zen-card p-5 flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <label className="label-zen">Current Stage</label>

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
                    'flex items-center gap-3 w-full text-left rounded-lg px-2 py-2 transition-colors',
                    isCurrent
                      ? 'bg-accent/10 hover:bg-accent/15'
                      : 'hover:bg-rice-50'
                  )}
                >
                  <div className={clsx(
                    'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border',
                    isCurrent ? 'bg-accent border-accent' :
                    isPast ? 'bg-success/10 border-success/30 text-success' :
                    'bg-transparent border-border'
                  )}>
                    {isPast && <span className="text-[10px] font-bold">✓</span>}
                    {isCurrent && <span className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className={clsx(
                    'text-sm',
                    isCurrent ? 'text-accent font-semibold' :
                    isPast ? 'text-foreground' :
                    'text-ink-400'
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
            <span className="label-zen mb-3">Stage History</span>
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
                      <span className="text-sm font-medium text-foreground">
                        {formatStage(entry.stage)}
                      </span>
                      <span className="text-xs text-ink-400">
                        {formatDate(entry.entered_at)}
                      </span>
                      {days !== null && (
                        <span className="text-xs text-ink-400">
                          · {days} {days === 1 ? 'day' : 'days'}
                        </span>
                      )}
                    </div>
                    {entry.notes && (
                      <p className="text-sm text-ink-500 leading-relaxed">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="zen-card p-6 w-full max-w-md mx-4 flex flex-col gap-4">
            <h3 className="text-lg font-display font-semibold text-foreground">
              Move to {formatStage(targetStage)}?
            </h3>
            <textarea
              placeholder="Add notes for this stage transition (optional)"
              value={modalNotes}
              onChange={e => setModalNotes(e.target.value)}
              rows={3}
              className="input-zen resize-none"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeModal}
                disabled={isSaving}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={confirmStageChange}
                disabled={isSaving}
                className="btn-primary"
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
