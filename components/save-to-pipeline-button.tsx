'use client'

import { useState, useTransition } from 'react'
import { saveToPipeline } from '@/actions/pipeline'

interface SaveToPipelineButtonProps {
  propertyId: string
}

export function SaveToPipelineButton({ propertyId }: SaveToPipelineButtonProps) {
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      className="w-full rounded-card bg-accent px-4 py-2 text-sm font-semibold text-bg transition hover:bg-accent-hover disabled:opacity-70"
      onClick={() => {
        if (saved || isPending) return
        setSaved(true)
        startTransition(async () => {
          try {
            await saveToPipeline(propertyId)
          } catch {
            setSaved(false)
          }
        })
      }}
      disabled={saved || isPending}
    >
      {saved ? 'In Pipeline ✓' : isPending ? 'Adding...' : 'Add to Pipeline'}
    </button>
  )
}
