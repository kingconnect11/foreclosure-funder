'use client'

export default function PipelineError({
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="dossier-card p-8 text-center">
      <p className="font-display text-3xl mb-2">Pipeline unavailable</p>
      <p className="text-sm text-text-secondary mb-4">
        We could not load your pipeline at this moment.
      </p>
      <button onClick={reset} className="btn-primary">
        Try again
      </button>
    </div>
  )
}
