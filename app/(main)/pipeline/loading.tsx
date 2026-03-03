export default function PipelineLoading() {
  return (
    <div className="flex flex-col gap-8">
      {/* Summary stats */}
      <div className="flex flex-wrap gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 w-28 bg-border/50 rounded animate-pulse" />
        ))}
      </div>
      {/* Kanban columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="min-w-[280px] flex flex-col gap-3 animate-pulse flex-shrink-0">
            <div className="h-5 w-24 bg-border/50 rounded" />
            {[...Array(2)].map((_, j) => (
              <div key={j} className="bg-surface border border-border rounded p-4">
                <div className="h-4 w-3/4 bg-border/50 rounded mb-2" />
                <div className="h-3 w-1/2 bg-border/50 rounded mb-3" />
                <div className="h-3 w-20 bg-border/50 rounded" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
