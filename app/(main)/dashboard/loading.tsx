export default function DashboardLoading() {
  return (
    <section className="space-y-6 animate-pulse">
      <div className="h-10 w-60 bg-surface-elevated rounded-ledger" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="dossier-card h-32 bg-surface-elevated" />
        ))}
      </div>
      <div className="dossier-card h-28 bg-surface-elevated" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="dossier-card h-72 bg-surface-elevated" />
        ))}
      </div>
    </section>
  )
}
