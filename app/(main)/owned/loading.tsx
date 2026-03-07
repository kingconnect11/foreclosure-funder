export default function OwnedLoading() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-64 bg-surface border border-border rounded animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-24 bg-surface border border-border rounded animate-pulse" />
        ))}
      </div>
      <div className="h-[420px] bg-surface border border-border rounded animate-pulse" />
    </div>
  )
}
