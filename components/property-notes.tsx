'use client'

import { useState, useEffect } from 'react'
import { updateNotes } from '@/actions/pipeline'

export function PropertyNotes({ pipelineId, initialNotes }: { pipelineId: string, initialNotes: string | null }) {
  const [notes, setNotes] = useState(initialNotes ?? '')
  const [lastSaved, setLastSaved] = useState(initialNotes ?? '')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  useEffect(() => {
    setNotes(initialNotes ?? '')
    setLastSaved(initialNotes ?? '')
  }, [pipelineId, initialNotes])

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (notes !== lastSaved) {
        setSaveStatus('saving')
        try {
          await updateNotes(pipelineId, notes)
          setLastSaved(notes)
          setSaveStatus('saved')
          setTimeout(() => setSaveStatus('idle'), 2000)
        } catch {
          setSaveStatus('idle')
        }
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [notes, pipelineId, lastSaved])

  return (
    <div className="flex flex-col gap-3 group">
      <div className="flex items-baseline justify-between ledger-divider pb-2">
        <h3 className="font-display text-2xl text-text-primary">Research Notes</h3>
        <div className="font-data text-xs uppercase tracking-widest min-w-[80px] text-right">
          {saveStatus === 'saving' && <span className="text-text-muted">Saving...</span>}
          {saveStatus === 'saved' && <span className="text-success">Saved ✓</span>}
        </div>
      </div>
      <textarea 
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={async () => {
          if (notes !== lastSaved) {
            setSaveStatus('saving')
            try {
              await updateNotes(pipelineId, notes)
              setLastSaved(notes)
              setSaveStatus('saved')
              setTimeout(() => setSaveStatus('idle'), 2000)
            } catch {
              setSaveStatus('idle')
            }
          }
        }}
        placeholder="Document findings, risks, and strategy..."
        className="w-full min-h-[170px] bg-surface border border-border rounded-ledger p-4 text-sm text-text-primary focus:outline-none focus:border-accent resize-y transition-colors font-body"
      />
    </div>
  )
}
