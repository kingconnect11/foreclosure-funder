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
    <div className="flex flex-col gap-2 mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[20px] font-display text-accent">Admin: Group Notes</h3>
        {saveStatus === 'saving' && <span className="text-xs text-ink-500">Saving...</span>}
        {saveStatus === 'saved' && <span className="text-xs text-success">Saved ✓</span>}
      </div>
      <p className="text-xs text-ink-500 mb-1">These notes will be visible to investors in your deal room who have this property in their pipeline.</p>
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
        className="w-full h-32 bg-surface border border-accent/50 rounded p-3 text-sm text-foreground focus:outline-none focus:border-accent resize-y"
      />
    </div>
  )
}
