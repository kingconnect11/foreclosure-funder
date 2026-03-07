export default function Loading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-8 animate-pulse">
      <div className="space-y-8">
        <div className="space-y-3">
          <div className="h-6 w-40 rounded bg-rice-100" />
          <div className="h-8 w-4/5 rounded bg-rice-100" />
          <div className="h-5 w-1/2 rounded bg-rice-100" />
        </div>

        {Array.from({ length: 3 }).map((_, index) => (
          <section key={index} className="zen-card p-5 space-y-4">
            <div className="h-6 w-56 rounded bg-rice-100" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((__, cellIndex) => (
                <div key={cellIndex} className="h-12 rounded bg-rice-100" />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="space-y-6">
        <div className="zen-card p-5 space-y-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="h-8 rounded bg-rice-100" />
          ))}
        </div>
        <div className="zen-card p-5 space-y-3">
          <div className="h-5 w-40 rounded bg-rice-100" />
          <div className="h-10 w-full rounded bg-rice-100" />
          <div className="h-10 w-2/3 rounded bg-rice-100" />
        </div>
      </div>
    </div>
  )
}
