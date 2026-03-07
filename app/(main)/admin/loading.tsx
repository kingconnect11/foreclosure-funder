export default function Loading() {
  return (
    <div className="flex flex-col gap-12 pb-12 animate-pulse">
      <div className="h-9 w-44 rounded bg-rice-100" />

      <section className="flex flex-col gap-4">
        <div className="h-7 w-28 rounded bg-rice-100" />
        <div className="zen-card p-5 space-y-4">
          <div className="h-10 w-full rounded bg-rice-100" />
          <div className="h-10 w-full rounded bg-rice-100" />
          <div className="h-10 w-full rounded bg-rice-100" />
          <div className="h-10 w-full rounded bg-rice-100" />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="h-7 w-36 rounded bg-rice-100" />
        <div className="zen-card p-5 space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-16 w-full rounded bg-rice-100" />
          ))}
        </div>
      </section>
    </div>
  )
}
