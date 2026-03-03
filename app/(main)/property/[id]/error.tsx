'use client'

export default function PropertyError({
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="dossier-card p-8 text-center">
      <p className="font-display text-3xl mb-2">Property could not load</p>
      <p className="text-sm text-text-secondary mb-4">
        We hit a data error while loading this property. Try again.
      </p>
      <button onClick={reset} className="btn-primary">
        Try again
      </button>
    </div>
  )
}
