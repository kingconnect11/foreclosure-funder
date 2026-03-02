interface StatCardProps {
  label: string
  value: number
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <article className="rounded-card border border-border bg-surface p-5">
      <p className="mb-3 text-xs uppercase tracking-[0.08em] text-text-muted">{label}</p>
      <p className="font-data text-[32px] leading-[1.1] text-text-primary">{value}</p>
    </article>
  )
}
