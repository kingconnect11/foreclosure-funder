export function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="dossier-card p-5 md:p-6 flex flex-col justify-between items-start min-h-[132px]">
      <span className="kicker">{label}</span>
      <span className="font-display text-4xl md:text-5xl text-text-primary mt-2">
        {value}
      </span>
    </div>
  )
}
