'use client'

import { useState, useEffect } from 'react'
import { updateNotes } from '@/actions/pipeline'
import { FileText, Check, Loader2 } from 'lucide-react'

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

  const handleBlur = async () => {
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
  }

  return (
    <div className="zen-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-ink-500" />
          <h3 className="font-semibold text-foreground">Research Notes</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {saveStatus === 'saving' && (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-ink-400" />
              <span className="text-ink-400">Saving...</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <Check className="w-3.5 h-3.5 text-success" />
              <span className="text-success">Saved</span>
            </>
          )}
        </div>
      </div>
      
      <textarea 
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={handleBlur}
        placeholder="Document your research findings, inspection notes, offer strategy, and any concerns about this property..."
        className="w-full min-h-[180px] bg-rice-50 border border-border rounded-lg p-4 
                   text-sm text-foreground placeholder:text-ink-400
                   focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10
                   resize-y transition-all"
      />
    </div>
  )
}
