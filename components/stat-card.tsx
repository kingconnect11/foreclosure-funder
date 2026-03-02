export function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="group relative bg-surface border border-border rounded p-6 flex flex-col justify-center items-start overflow-hidden transition-all duration-300 hover:border-accent/40 hover:shadow-glow hover:-translate-y-1">
      {/* Background gradient flare */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/10 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <span className="relative z-10 text-[12px] font-medium uppercase tracking-[0.05em] text-text-muted mb-3">
        {label}
      </span>
      <span className="relative z-10 font-data text-[36px] leading-none text-text-primary group-hover:text-accent transition-colors duration-300">
        {value}
      </span>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent group-hover:w-full transition-all duration-500 ease-out" />
    </div>
  )
}
