'use client'

import { InvestorPipeline, PipelineStage, PipelineStageHistory } from '@/lib/types'
import { saveToPipeline, changeStage, changeStageAndConvertToOwned } from '@/actions/pipeline'
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
  propertyPrefill,
}: {
  propertyId: string
  pipelineEntry: InvestorPipeline | null
  stageHistory?: PipelineStageHistory[]
  propertyPrefill?: {
    address: string | null
    city: string | null
    state: string | null
    zipCode: string | null
    purchasePrice: number | null
    currentValue: number | null
  }
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [targetStage, setTargetStage] = useState<PipelineStage | null>(null)
  const [modalNotes, setModalNotes] = useState('')
  const [ownedDraft, setOwnedDraft] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    acquiredAt: '',
    purchasePrice: '',
    currentValue: '',
    constructionCostTotal: '',
    legalFeesTotal: '',
    interestPaidTotal: '',
    ownedNotes: '',
  })
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
    if (stage === 'closed') {
      setOwnedDraft({
        address: propertyPrefill?.address ?? '',
        city: propertyPrefill?.city ?? '',
        state: propertyPrefill?.state ?? '',
        zipCode: propertyPrefill?.zipCode ?? '',
        acquiredAt: new Date().toISOString().slice(0, 10),
        purchasePrice:
          propertyPrefill?.purchasePrice !== null && propertyPrefill?.purchasePrice !== undefined
            ? String(propertyPrefill.purchasePrice)
            : '',
        currentValue:
          propertyPrefill?.currentValue !== null && propertyPrefill?.currentValue !== undefined
            ? String(propertyPrefill.currentValue)
            : '',
        constructionCostTotal: '',
        legalFeesTotal: '',
        interestPaidTotal: '',
        ownedNotes: '',
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setTargetStage(null)
    setModalNotes('')
    setOwnedDraft({
      address: '',
      city: '',
      state: '',
      zipCode: '',
      acquiredAt: '',
      purchasePrice: '',
      currentValue: '',
      constructionCostTotal: '',
      legalFeesTotal: '',
      interestPaidTotal: '',
      ownedNotes: '',
    })
  }

  const confirmStageChange = async () => {
    if (!pipelineEntry || !targetStage || isSaving) return
    setIsSaving(true)
    try {
      if (targetStage === 'closed') {
        await changeStageAndConvertToOwned(
          pipelineEntry.id,
          {
            address: ownedDraft.address.trim(),
            city: ownedDraft.city.trim() || null,
            state: ownedDraft.state.trim() || null,
            zipCode: ownedDraft.zipCode.trim() || null,
            acquiredAt: ownedDraft.acquiredAt,
            purchasePrice: Number(ownedDraft.purchasePrice || 0),
            currentValue: Number(ownedDraft.currentValue || 0),
            constructionCostTotal: Number(ownedDraft.constructionCostTotal || 0),
            legalFeesTotal: Number(ownedDraft.legalFeesTotal || 0),
            interestPaidTotal: Number(ownedDraft.interestPaidTotal || 0),
            notes: ownedDraft.ownedNotes.trim() || null,
          },
          modalNotes.trim() || undefined
        )
      } else {
        await changeStage(pipelineEntry.id, targetStage, modalNotes.trim() || undefined)
      }
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
          <div className="zen-card p-6 w-full max-w-2xl mx-4 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-display font-semibold text-foreground">
              Move to {formatStage(targetStage)}?
            </h3>

            {targetStage === 'closed' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <p className="sm:col-span-2 text-sm text-text-secondary">
                  Closing will move this property from Pipeline to Owned and create an owned-property record.
                </p>
                <input
                  value={ownedDraft.address}
                  onChange={(e) => setOwnedDraft((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Address"
                  className="input-zen sm:col-span-2"
                  required
                />
                <input
                  value={ownedDraft.city}
                  onChange={(e) => setOwnedDraft((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="City"
                  className="input-zen"
                />
                <input
                  value={ownedDraft.state}
                  onChange={(e) => setOwnedDraft((prev) => ({ ...prev, state: e.target.value }))}
                  placeholder="State"
                  className="input-zen"
                />
                <input
                  value={ownedDraft.zipCode}
                  onChange={(e) => setOwnedDraft((prev) => ({ ...prev, zipCode: e.target.value }))}
                  placeholder="ZIP"
                  className="input-zen"
                />
                <input
                  type="date"
                  value={ownedDraft.acquiredAt}
                  onChange={(e) => setOwnedDraft((prev) => ({ ...prev, acquiredAt: e.target.value }))}
                  className="input-zen"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={ownedDraft.purchasePrice}
                  onChange={(e) => setOwnedDraft((prev) => ({ ...prev, purchasePrice: e.target.value }))}
                  placeholder="Purchase Price"
                  className="input-zen"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={ownedDraft.currentValue}
                  onChange={(e) => setOwnedDraft((prev) => ({ ...prev, currentValue: e.target.value }))}
                  placeholder="Current Value"
                  className="input-zen"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={ownedDraft.constructionCostTotal}
                  onChange={(e) =>
                    setOwnedDraft((prev) => ({ ...prev, constructionCostTotal: e.target.value }))
                  }
                  placeholder="Construction Total"
                  className="input-zen"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={ownedDraft.legalFeesTotal}
                  onChange={(e) => setOwnedDraft((prev) => ({ ...prev, legalFeesTotal: e.target.value }))}
                  placeholder="Legal Fees Total"
                  className="input-zen"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={ownedDraft.interestPaidTotal}
                  onChange={(e) =>
                    setOwnedDraft((prev) => ({ ...prev, interestPaidTotal: e.target.value }))
                  }
                  placeholder="Interest Paid Total"
                  className="input-zen"
                />
                <textarea
                  value={ownedDraft.ownedNotes}
                  onChange={(e) => setOwnedDraft((prev) => ({ ...prev, ownedNotes: e.target.value }))}
                  rows={3}
                  className="input-zen resize-none sm:col-span-2"
                  placeholder="Owned property notes (optional)"
                />
              </div>
            )}

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
