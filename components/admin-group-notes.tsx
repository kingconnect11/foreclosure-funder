'use client'

import { useState, useEffect } from 'react'
import { updateGroupNotes } from '@/actions/admin'

export function AdminGroupNotes({ pipelineId, initialNotes }: { pipelineId: string, initialNotes: string | null }) {
  const [notes, setNotes] = useState(initialNotes || '')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (notes !== (initialNotes || '')) {
        setSaveStatus('saving')
        try {
          await updateGroupNotes(pipelineId, notes)
          setSaveStatus('saved')
          setTimeout(() => setSaveStatus('idle'), 2000)
        } catch (e) {
          setSaveStatus('idle')
        }
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [notes, pipelineId, initialNotes])

  return (
    <div className="flex flex-col gap-3 mt-8 relative">
      <div className="flex items-baseline justify-between ledger-divider pb-2 border-accent/30">
        <div className="flex items-baseline gap-3">
          <h3 className="font-display text-2xl text-accent">Admin: Group Notes</h3>
          <span className="text-xs text-text-muted hidden md:inline">Visible to deal room</span>
        </div>
        <div className="font-data text-xs uppercase tracking-widest min-w-[80px] text-right">
          {saveStatus === 'saving' && <span className="text-text-muted">Saving...</span>}
          {saveStatus === 'saved' && <span className="text-success">Saved ✓</span>}
        </div>
      </div>
      <textarea 
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={async () => {
          if (notes !== (initialNotes || '')) {
            setSaveStatus('saving')
            try {
              await updateGroupNotes(pipelineId, notes)
              setSaveStatus('saved')
              setTimeout(() => setSaveStatus('idle'), 2000)
            } catch (e) {}
          }
        }}
        placeholder="Add instructions or context for the deal room..."
        className="w-full min-h-[120px] bg-surface border border-accent/20 rounded-sm p-4 text-sm text-text-primary focus:outline-none focus:border-accent resize-y transition-colors font-body"
      />
    </div>
  )
}
