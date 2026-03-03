export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-surface border border-border rounded p-5 hover:border-surface-elevated transition-colors flex flex-col items-center justify-center">
      <span className="text-text-muted uppercase text-[12px] tracking-[0.05em] font-medium mb-2">{label}</span>
      <span className="font-data text-[32px] leading-[1.1] text-text-primary">{value}</span>
    </div>
  )
}