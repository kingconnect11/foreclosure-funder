export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-12 animate-pulse">
      <div className="h-8 w-40 bg-border/50 rounded" />
      {/* Investor table */}
      <div className="flex flex-col gap-3">
        <div className="h-5 w-24 bg-border/50 rounded" />
        <div className="bg-surface border border-border rounded overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-6 px-5 py-4 border-b border-border last:border-0">
              <div className="h-4 w-32 bg-border/50 rounded" />
              <div className="h-4 w-40 bg-border/50 rounded" />
              <div className="h-4 w-16 bg-border/50 rounded" />
              <div className="h-4 w-12 bg-border/50 rounded" />
            </div>
          ))}
        </div>
      </div>
      {/* Activity feed */}
      <div className="flex flex-col gap-3">
        <div className="h-5 w-32 bg-border/50 rounded" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3 py-3">
            <div className="w-8 h-8 rounded-full bg-border/50 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="h-4 w-3/4 bg-border/50 rounded mb-1" />
              <div className="h-3 w-20 bg-border/50 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
