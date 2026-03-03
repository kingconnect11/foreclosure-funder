'use client'

import { useState, useEffect } from 'react'
import { updateNotes } from '@/actions/pipeline'

export function PropertyNotes({ pipelineId, initialNotes }: { pipelineId: string, initialNotes: string | null }) {
  const [notes, setNotes] = useState(initialNotes || '')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (notes !== (initialNotes || '')) {
        setSaveStatus('saving')
        try {
          await updateNotes(pipelineId, notes)
          setSaveStatus('saved')
          setTimeout(() => setSaveStatus('idle'), 2000)
        } catch (e) {
          console.error('Failed to save notes:', e)
          setSaveStatus('idle')
        }
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [notes, pipelineId, initialNotes])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-[20px] font-display text-text-primary">Your Notes</h3>
        {saveStatus === 'saving' && <span className="text-xs text-text-muted">Saving...</span>}
        {saveStatus === 'saved' && <span className="text-xs text-success">Saved ✓</span>}
      </div>
      <textarea 
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={async () => {
          if (notes !== (initialNotes || '')) {
            setSaveStatus('saving')
            try {
              await updateNotes(pipelineId, notes)
              setSaveStatus('saved')
              setTimeout(() => setSaveStatus('idle'), 2000)
            } catch (e) {
              console.error('Failed to save notes on blur:', e)
            }
          }
        }}
        placeholder="Add your research notes here..."
        className="w-full h-32 bg-surface border border-border rounded p-3 text-sm text-text-primary focus:outline-none focus:border-accent resize-y"
      />
    </div>
  )
}