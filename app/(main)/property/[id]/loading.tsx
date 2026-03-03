export default function PropertyLoading() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[66%_34%] gap-6 animate-pulse">
      <div className="space-y-6">
        <div className="dossier-card h-40 bg-surface-elevated" />
        <div className="dossier-card h-80 bg-surface-elevated" />
        <div className="dossier-card h-96 bg-surface-elevated" />
      </div>
      <div className="space-y-6">
        <div className="dossier-card h-[480px] bg-surface-elevated" />
        <div className="dossier-card h-40 bg-surface-elevated" />
      </div>
    </div>
  )
}
