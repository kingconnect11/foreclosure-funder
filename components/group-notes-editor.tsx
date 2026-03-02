'use client'

import { useState, useTransition } from 'react'
import { updateGroupNotes } from '@/actions/admin'

interface GroupNotesEditorProps {
  pipelineId: string
  initialValue: string
}

export function GroupNotesEditor({
  pipelineId,
  initialValue,
}: GroupNotesEditorProps) {
  const [notes, setNotes] = useState(initialValue)
  const [isPending, startTransition] = useTransition()

  return (
    <div>
      <textarea
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full resize-y rounded-card border border-border bg-bg px-3 py-2 text-xs text-text-primary outline-none transition focus:border-accent"
      />
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              try {
                await updateGroupNotes(pipelineId, notes)
              } catch {
                return
              }
            })
          }}
          className="rounded-card border border-border px-3 py-2 text-[11px] uppercase tracking-[0.08em] text-text-secondary transition hover:border-text-secondary hover:text-text-primary disabled:opacity-60"
        >
          {isPending ? 'Saving...' : 'Save Group Note'}
        </button>
      </div>
    </div>
  )
}
