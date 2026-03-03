"use client"

import { useState, useEffect, useTransition } from "react"
import { updateNotes } from "@/actions/pipeline"

export function NotesSection({ 
  pipelineId, 
  initialNotes,
  groupNotes,
  dealRoomName 
}: { 
  pipelineId?: string 
  initialNotes?: string | null
  groupNotes?: string | null
  dealRoomName?: string
}) {
  const [notes, setNotes] = useState(initialNotes || "")
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (notes === (initialNotes || "")) return

    setStatus("saving")
    const timer = setTimeout(() => {
      startTransition(async () => {
        if (pipelineId) {
          await updateNotes(pipelineId, notes)
          setStatus("saved")
          setTimeout(() => setStatus("idle"), 2000)
        }
      })
    }, 2000)

    return () => clearTimeout(timer)
  }, [notes, initialNotes, pipelineId])

  const handleBlur = () => {
    if (notes !== (initialNotes || "") && pipelineId) {
      startTransition(async () => {
        setStatus("saving")
        await updateNotes(pipelineId, notes)
        setStatus("saved")
        setTimeout(() => setStatus("idle"), 2000)
      })
    }
  }

  if (!pipelineId) {
    return (
      <div className="rounded-sharp border border-border bg-surface-1 p-6 mb-8">
        <h2 className="font-serif text-xl font-semibold mb-4 border-b border-border pb-4">Your Notes</h2>
        <div className="bg-surface-2/50 border border-dashed border-border rounded-sharp p-6 text-center">
          <p className="text-muted text-sm">Save this property to your pipeline to add notes.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-sharp border border-border bg-surface-1 p-6 mb-8">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
        <h2 className="font-serif text-xl font-semibold">Your Notes</h2>
        <span className="text-xs text-muted">
          {status === "saving" && "Saving..."}
          {status === "saved" && <span className="text-accent-pine">Saved</span>}
        </span>
      </div>
      <textarea
        className="w-full h-32 rounded-sharp border border-border bg-background p-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent-pine resize-y mb-6"
        placeholder="Add your research notes, inspection details, or offer strategy here..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={handleBlur}
      />

      {groupNotes && (
        <div className="mt-6">
          <h3 className="font-medium text-sm mb-3">Group Notes from {dealRoomName}</h3>
          <div className="bg-accent-pine/5 border border-accent-pine/20 rounded-sharp p-4 text-sm text-foreground">
            {groupNotes}
          </div>
        </div>
      )}
    </div>
  )
}
