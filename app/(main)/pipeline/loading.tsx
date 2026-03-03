export default function PipelineLoading() {
  return (
    <section className="space-y-6 animate-pulse">
      <div className="h-10 w-40 bg-surface-elevated rounded-ledger" />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="dossier-card h-24 bg-surface-elevated" />
        ))}
      </div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="dossier-card h-[460px] w-[320px] shrink-0 bg-surface-elevated" />
        ))}
      </div>
    </section>
  )
}
