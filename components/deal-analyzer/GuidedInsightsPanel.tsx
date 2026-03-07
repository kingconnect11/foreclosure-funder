'use client'

import { AlertTriangle, CheckCircle2, Sparkles, ShieldAlert, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  DealInsight,
  DealStrategy,
  InsightAction,
  InsightSeverity,
} from '@/lib/deal-analyzer/insights'

type InsightFilter = 'all' | DealStrategy

interface GuidedInsightsPanelProps {
  insights: DealInsight[]
  filter: InsightFilter
  onFilterChange: (filter: InsightFilter) => void
  onApplyAction: (action: InsightAction) => void
  onUndo: () => void
  canUndo: boolean
}

const filterOptions: { id: InsightFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'flip', label: 'Flip' },
  { id: 'rental', label: 'Rental' },
  { id: 'wholesale', label: 'Wholesale' },
  { id: 'cross', label: 'Cross' },
]

const severityConfig: Record<
  InsightSeverity,
  {
    icon: typeof AlertTriangle
    tone: string
    badge: string
    label: string
  }
> = {
  risk: {
    icon: ShieldAlert,
    tone: 'border-danger/25 bg-danger/5',
    badge: 'text-danger bg-danger/10 border-danger/20',
    label: 'Risk',
  },
  caution: {
    icon: AlertTriangle,
    tone: 'border-warning/30 bg-warning/5',
    badge: 'text-warning-dark bg-warning/10 border-warning/20',
    label: 'Caution',
  },
  good: {
    icon: CheckCircle2,
    tone: 'border-success/30 bg-success/5',
    badge: 'text-success bg-success/10 border-success/20',
    label: 'Good',
  },
}

export function GuidedInsightsPanel({
  insights,
  filter,
  onFilterChange,
  onApplyAction,
  onUndo,
  canUndo,
}: GuidedInsightsPanelProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-zen space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-display font-semibold text-foreground">
              Guided Insights
            </h3>
            <p className="text-2xs text-ink-500">
              Actionable notes derived from your current assumptions
            </p>
          </div>
        </div>

        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all',
            canUndo
              ? 'border-border text-ink-600 hover:bg-rice-100'
              : 'border-border text-ink-300 cursor-not-allowed'
          )}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Undo Last
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onFilterChange(option.id)}
            className={cn(
              'px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-[0.05em] transition-all',
              filter === option.id
                ? 'bg-accent/10 text-accent border border-accent/20'
                : 'bg-rice-50 text-ink-500 border border-border hover:text-ink-700'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {insights.length === 0 ? (
        <div className="rounded-xl border border-border bg-rice-50 px-4 py-6 text-center text-sm text-ink-500">
          No insights for this filter yet.
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight) => {
            const config = severityConfig[insight.severity]
            const Icon = config.icon

            return (
              <article
                key={insight.id}
                className={cn(
                  'rounded-xl border px-4 py-3.5 space-y-3 transition-all',
                  config.tone
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <h4 className="text-sm font-semibold text-foreground">{insight.title}</h4>
                    </div>
                    <p className="text-xs text-ink-600 leading-relaxed">{insight.message}</p>
                  </div>

                  <div
                    className={cn(
                      'inline-flex items-center gap-1 border rounded-full px-2.5 py-1 text-2xs font-semibold uppercase tracking-[0.06em]',
                      config.badge
                    )}
                  >
                    {config.label}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-2xs">
                  <span className="text-ink-400 uppercase tracking-[0.08em]">
                    {insight.metric}
                  </span>
                  <span className="font-mono font-semibold text-foreground">{insight.metricValue}</span>
                </div>

                {insight.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {insight.actions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => onApplyAction(action)}
                        className="px-3 py-2 rounded-lg bg-surface border border-border text-xs font-medium text-ink-700 hover:border-accent/30 hover:text-accent transition-all"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
