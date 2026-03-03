import { cn } from "@/lib/utils"

export function StatCard({ label, value, className }: { label: string; value: number | string; className?: string }) {
  return (
    <div className={cn("rounded-sharp border border-border bg-surface-1 p-6 flex flex-col justify-center", className)}>
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="mt-2 font-mono text-3xl font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  )
}
