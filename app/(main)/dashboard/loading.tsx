export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-9 w-44 rounded bg-rice-100" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="zen-card p-4 space-y-3">
            <div className="h-3 w-24 rounded bg-rice-100" />
            <div className="h-7 w-20 rounded bg-rice-100" />
          </div>
        ))}
      </div>

      <div className="zen-card p-4 lg:p-5 space-y-4">
        <div className="h-10 w-full rounded bg-rice-100" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="h-10 rounded bg-rice-100" />
          <div className="h-10 rounded bg-rice-100" />
          <div className="h-10 rounded bg-rice-100" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="zen-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-5 w-28 rounded bg-rice-100" />
              <div className="h-5 w-20 rounded bg-rice-100" />
            </div>
            <div className="h-6 w-3/4 rounded bg-rice-100" />
            <div className="h-4 w-1/2 rounded bg-rice-100" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-rice-100" />
              <div className="h-4 w-full rounded bg-rice-100" />
              <div className="h-4 w-2/3 rounded bg-rice-100" />
            </div>
            <div className="h-10 w-full rounded bg-rice-100" />
          </div>
        ))}
      </div>
    </div>
  )
}
