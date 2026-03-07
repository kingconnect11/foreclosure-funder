export default function Loading() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      <div className="h-9 w-36 rounded bg-rice-100" />

      <div className="flex flex-wrap gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="zen-card min-w-[140px] px-6 py-4 space-y-2">
            <div className="h-3 w-20 rounded bg-rice-100" />
            <div className="h-6 w-12 rounded bg-rice-100" />
          </div>
        ))}
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max">
          {Array.from({ length: 3 }).map((_, columnIndex) => (
            <div key={columnIndex} className="w-[320px] space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="h-4 w-28 rounded bg-rice-100" />
                <div className="h-5 w-8 rounded bg-rice-100" />
              </div>
              {Array.from({ length: 2 }).map((__, cardIndex) => (
                <div key={cardIndex} className="zen-card p-4 space-y-3">
                  <div className="h-5 w-3/4 rounded bg-rice-100" />
                  <div className="h-4 w-1/2 rounded bg-rice-100" />
                  <div className="h-4 w-full rounded bg-rice-100" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
