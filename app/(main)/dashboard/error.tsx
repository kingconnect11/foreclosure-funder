'use client'

export default function DashboardError({
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="dossier-card p-8 text-center">
      <p className="font-display text-3xl mb-2">Dashboard unavailable</p>
      <p className="text-sm text-text-secondary mb-4">
        We could not load current property data. Try again.
      </p>
      <button onClick={reset} className="btn-primary">
        Try again
      </button>
    </div>
  )
}
