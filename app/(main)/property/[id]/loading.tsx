export default function PropertyDetailLoading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-8">
      <div className="flex flex-col gap-12 animate-pulse">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="h-4 w-24 bg-border/50 rounded" />
          <div className="h-8 w-3/4 bg-border/50 rounded" />
          <div className="h-4 w-1/3 bg-border/50 rounded" />
        </div>
        {/* Property details grid */}
        <div className="bg-surface border border-border rounded p-5">
          <div className="grid grid-cols-2 gap-y-4 gap-x-8">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="h-3 w-16 bg-border/50 rounded" />
                <div className="h-4 w-24 bg-border/50 rounded" />
              </div>
            ))}
          </div>
        </div>
        {/* Court research */}
        <div className="bg-surface border border-border rounded p-5 h-32" />
      </div>
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="bg-surface border border-border rounded p-5 h-64" />
        <div className="bg-surface border border-border rounded p-4 h-12" />
      </div>
    </div>
  )
}
