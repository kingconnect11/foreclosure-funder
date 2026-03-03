import { getUserPipeline, getCurrentUser } from '@/lib/queries'
import { PipelineCard, PipelineEntryWithProperty } from '@/components/pipeline-card'
import { PipelineStage } from '@/lib/types'
import Link from 'next/link'
import { Bookmark } from 'lucide-react'
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts'

const STAGES: PipelineStage[] = [
  'watching', 'researching', 'site_visit', 'preparing_offer', 
  'offer_submitted', 'counter_offered', 'offer_accepted', 
  'in_closing', 'closed', 'rejected', 'no_response', 'passed'
]

const formatStage = (s: string) => s.replace(/_/g, ' ').toUpperCase()

export default async function PipelinePage() {
  const user = await getCurrentUser()
  if (!user) return null

  const pipeline = await getUserPipeline(user.id)

  const stages = pipeline.reduce(
    (acc, entry) => {
      const stage = entry.stage ?? 'watching'
      if (!acc[stage]) acc[stage] = []
      acc[stage].push(entry)
      return acc
    },
    {} as Record<string, typeof pipeline>
  )

  const totalCount = pipeline.length
  const watchingCount = stages['watching']?.length ?? 0
  const activeStages = ['researching', 'site_visit', 'preparing_offer', 'offer_submitted', 'counter_offered', 'offer_accepted', 'in_closing']
  const activeCount = pipeline.filter((e) =>
    activeStages.includes(e.stage ?? '')
  ).length
  const closedCount = stages['closed']?.length ?? 0
  const passedCount = (stages['passed']?.length ?? 0) + (stages['rejected']?.length ?? 0) + (stages['no_response']?.length ?? 0)

  // Only show columns that have at least one property
  const activeColumns = STAGES.filter(stage => stages[stage] && stages[stage].length > 0)

  return (
    <div className="flex flex-col min-h-[calc(100vh-104px)]">
      <KeyboardShortcuts isAdmin={user.role === 'admin' || user.role === 'super_admin'} />
      <div className="mb-8 flex flex-col gap-6">
        <h1 className="font-display font-bold text-[28px] text-text-primary">Pipeline</h1>
        
        <div className="flex flex-wrap gap-4">
        {[
            { label: 'Total in Pipeline', value: totalCount },
            { label: 'Watching', value: watchingCount },
            { label: 'Active', value: activeCount },
            { label: 'Closed', value: closedCount },
            { label: 'Passed/Rejected', value: passedCount }
          ].map(stat => (
            <div key={stat.label} className="bg-surface border border-border rounded px-6 py-4 flex flex-col gap-1 min-w-[140px]">
              <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-text-muted">{stat.label}</span>
              <span className="font-data text-[24px] text-text-primary">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 snap-x snap-mandatory">
        <div className="flex gap-4 md:gap-6 min-h-full items-start min-w-0">
          {activeColumns.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 w-full">
              <Bookmark className="w-10 h-10 text-text-muted" />
              <p className="text-text-secondary text-sm text-center max-w-sm">
                Your pipeline is empty. Browse the dashboard to save your first property.
              </p>
              <Link href="/dashboard" className="text-sm text-accent hover:text-accent-hover transition-colors">
                Go to Dashboard →
              </Link>
            </div>
          )}
          
          {activeColumns.map(stage => (
            <div key={stage} className="flex flex-col gap-4 w-[280px] min-w-[260px] flex-shrink-0 snap-start">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h2 className="font-body font-semibold text-[13px] uppercase tracking-[0.05em] text-text-secondary">
                  {formatStage(stage)}
                </h2>
                <span className="bg-surface-elevated text-text-secondary text-[12px] font-medium px-2 py-0.5 rounded">
                  {stages[stage].length}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {stages[stage].map(entry => (
                  <PipelineCard key={entry.id} entry={entry as unknown as PipelineEntryWithProperty} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}