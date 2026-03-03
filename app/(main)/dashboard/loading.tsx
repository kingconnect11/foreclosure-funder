export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8">
      {/* Stat cards skeleton — 4 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded p-5 animate-pulse">
            <div className="h-3 w-20 bg-border/50 rounded mb-3" />
            <div className="h-7 w-16 bg-border/50 rounded" />
          </div>
        ))}
      </div>

      {/* Filter bar skeleton */}
      <div className="flex flex-wrap gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 w-32 bg-border/50 rounded animate-pulse" />
        ))}
      </div>

      {/* Property grid skeleton — 6 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded p-5 animate-pulse">
            <div className="h-3 w-16 bg-border/50 rounded mb-3" />
            <div className="h-5 w-3/4 bg-border/50 rounded mb-2" />
            <div className="h-3 w-1/2 bg-border/50 rounded mb-4" />
            <div className="flex gap-4 mb-4">
              <div className="h-3 w-12 bg-border/50 rounded" />
              <div className="h-3 w-12 bg-border/50 rounded" />
              <div className="h-3 w-16 bg-border/50 rounded" />
            </div>
            <div className="h-4 w-24 bg-border/50 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
