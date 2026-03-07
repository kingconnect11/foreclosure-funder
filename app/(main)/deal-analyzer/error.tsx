'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <h2 className="text-xl font-semibold text-text-primary">Something went wrong</h2>
      <p className="text-sm text-text-muted max-w-md text-center">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-accent text-foreground rounded text-sm font-medium hover:bg-accent-hover transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
