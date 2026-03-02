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
    <div className="flex flex-col gap-2 mt-4 relative">
      <div className="absolute top-10 right-0 w-32 h-32 bg-accent/5 rounded-full blur-[40px] pointer-events-none" />
      <div className="flex items-center justify-between">
        <h3 className="text-[20px] font-display text-accent relative z-10">Admin: Group Notes</h3>
        {saveStatus === 'saving' && <span className="text-xs text-text-muted transition-opacity">Saving...</span>}
        {saveStatus === 'saved' && <span className="text-xs text-success transition-opacity">Saved ✓</span>}
      </div>
      <p className="text-xs text-text-muted mb-1 relative z-10">These notes will be visible to investors in your deal room who have this property in their pipeline.</p>
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
        placeholder="Add group notes here..."
        className="w-full h-32 bg-surface border border-accent/30 rounded p-4 text-sm text-text-primary focus:outline-none focus:border-accent focus:shadow-glow resize-y transition-all duration-300 relative z-10"
      />
    </div>
  )
}