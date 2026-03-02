'use client'

import { useState, useTransition } from 'react'
import { changeStage } from '@/actions/pipeline'
import type { PipelineStage } from '@/lib/types'

const STAGES: { value: PipelineStage; label: string }[] = [
  { value: 'watching', label: 'Watching' },
  { value: 'researching', label: 'Researching' },
  { value: 'site_visit', label: 'Site Visit' },
  { value: 'preparing_offer', label: 'Preparing Offer' },
  { value: 'offer_submitted', label: 'Offer Submitted' },
  { value: 'counter_offered', label: 'Counter-Offered' },
  { value: 'offer_accepted', label: 'Offer Accepted' },
  { value: 'in_closing', label: 'In Closing' },
  { value: 'closed', label: 'Closed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'no_response', label: 'No Response' },
  { value: 'passed', label: 'Passed' },
]

interface PipelineStageSelectProps {
  pipelineId: string
  current: PipelineStage
}

export function PipelineStageSelect({
  pipelineId,
  current,
}: PipelineStageSelectProps) {
  const [value, setValue] = useState(current)
  const [isPending, startTransition] = useTransition()

  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-[0.08em] text-text-muted">
        Update stage
      </span>
      <select
        value={value}
        disabled={isPending}
        onChange={(e) => {
          const nextValue = e.target.value as PipelineStage
          setValue(nextValue)
          startTransition(async () => {
            try {
              await changeStage(pipelineId, nextValue)
            } catch {
              setValue(current)
            }
          })
        }}
        className="h-10 w-full rounded-card border border-border bg-bg px-3 text-sm text-text-primary outline-none transition focus:border-accent disabled:opacity-70"
      >
        {STAGES.map((stage) => (
          <option key={stage.value} value={stage.value}>
            {stage.label}
          </option>
        ))}
      </select>
    </label>
  )
}
