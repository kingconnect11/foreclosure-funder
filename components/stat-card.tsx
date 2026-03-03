export function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="dossier-card p-6 flex flex-col justify-between items-start">
      <span className="label-text">{label}</span>
      <span className="font-display text-5xl text-accent mt-4">{value}</span>
    </div>
  )
}
