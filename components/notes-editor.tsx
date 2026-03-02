'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { updateNotes } from '@/actions/pipeline'

interface NotesEditorProps {
  pipelineId: string
  initialNotes: string
}

export function NotesEditor({ pipelineId, initialNotes }: NotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [isPending, startTransition] = useTransition()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didMountRef = useRef(false)

  const persist = (value: string) => {
    setStatus('saving')
    startTransition(async () => {
      try {
        await updateNotes(pipelineId, value)
        setStatus('saved')
        setTimeout(() => setStatus('idle'), 1200)
      } catch {
        setStatus('idle')
      }
    })
  }

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => persist(notes), 2000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [notes])

  return (
    <div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={() => persist(notes)}
        rows={7}
        placeholder="Add private notes about this property..."
        className="w-full resize-y rounded-card border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent"
      />
      <p className="mt-2 text-xs text-text-muted">
        {isPending || status === 'saving'
          ? 'Saving...'
          : status === 'saved'
            ? 'Saved'
            : 'Auto-saves after 2 seconds of inactivity'}
      </p>
    </div>
  )
}
