export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rice-100" />
          <div className="space-y-2">
            <div className="h-7 w-44 rounded bg-rice-100" />
            <div className="h-4 w-56 rounded bg-rice-100" />
          </div>
        </div>
        <div className="hidden md:block h-14 w-72 rounded-xl bg-rice-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-6">
          <div className="zen-card p-5 space-y-4">
            <div className="h-6 w-40 rounded bg-rice-100" />
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-10 rounded bg-rice-100" />
            ))}
          </div>
          <div className="zen-card p-5 space-y-4">
            <div className="h-6 w-40 rounded bg-rice-100" />
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-10 rounded bg-rice-100" />
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="zen-card p-2 h-14 rounded-xl bg-rice-100" />
          <div className="zen-card p-6 space-y-4">
            <div className="h-7 w-40 rounded bg-rice-100" />
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-10 rounded bg-rice-100" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
