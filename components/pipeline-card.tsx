'use client'

import { InvestorPipeline, Property } from '@/lib/types'
import { formatCurrency, formatDate, saleDateUrgency, timeInStage } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import { motion } from 'framer-motion'

export type PipelineEntryWithProperty = InvestorPipeline & {
  properties: Property
}

export function PipelineCard({ entry }: { entry: PipelineEntryWithProperty }) {
  const router = useRouter()
  const property = entry.properties

  const urgency = saleDateUrgency(property.sale_date)
  const dateColor = urgency === 'danger' ? 'text-danger font-medium' : urgency === 'warning' ? 'text-warning font-medium' : 'text-text-secondary'

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      onClick={() => router.push(`/property/${property.id}`)}
      className="card p-4 cursor-pointer group flex flex-col gap-3 relative overflow-hidden hover:shadow-glow hover:-translate-y-1 transition-all duration-300"
    >
      <div className="absolute top-0 right-0 w-16 h-16 bg-accent/5 rounded-bl-full -z-10 group-hover:bg-accent/15 transition-colors duration-500" />
      <div className="absolute inset-0 border border-accent/0 group-hover:border-accent/30 rounded transition-colors duration-500 pointer-events-none" />

      <div>
        <h3 className="font-display font-bold text-[16px] text-text-primary leading-tight group-hover:text-accent transition-colors truncate">
          {property.address}
        </h3>
        <p className="font-body text-[12px] text-text-muted mt-0.5 truncate">
          {property.city}, {property.zip_code}
        </p>
      </div>

      <div className="flex flex-col gap-1.5 bg-background/50 p-2 rounded border border-border">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wide text-text-muted">Appraisal</span>
          <span className="font-data text-[13px] text-text-primary">{formatCurrency(property.county_appraisal)}</span>
        </div>
        {property.sale_date && (
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-[10px] uppercase tracking-wide text-text-muted">Sale</span>
            <span className={clsx("font-data text-[12px]", dateColor)}>
              {formatDate(property.sale_date)}
            </span>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-border mt-1 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wide text-text-muted">Time in stage</span>
          <span className="text-[12px] text-text-secondary font-medium">{timeInStage(entry.stage_changed_at)}</span>
        </div>
        
        {entry.notes && (
          <p className="text-[12px] text-text-secondary italic line-clamp-2 leading-relaxed bg-surface-elevated/50 p-2 rounded border border-border mt-1">
            &quot;{entry.notes.length > 60 ? entry.notes.slice(0, 60) + '...' : entry.notes}&quot;
          </p>
        )}
      </div>
    </motion.div>
  )
}