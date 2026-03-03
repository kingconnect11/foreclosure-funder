import { getUserPipeline, getCurrentUser } from '@/lib/queries'
import { PipelineCard, PipelineEntryWithProperty } from '@/components/pipeline-card'
import { PipelineStage } from '@/lib/types'

const STAGES: PipelineStage[] = [
  'watching', 'researching', 'site_visit', 'preparing_offer', 
  'offer_submitted', 'counter_offered', 'offer_accepted', 
  'in_closing', 'closed', 'rejected', 'no_response', 'passed'
]

const formatStage = (s: string) => s.replace(/_/g, ' ')

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
      <div className="mb-10 flex flex-col gap-8">
        <div className="flex items-baseline justify-between ledger-divider pb-4">
          <h1 className="font-display text-4xl text-text-primary">Pipeline</h1>
          <span className="font-data text-xs text-text-muted uppercase tracking-widest hidden sm:inline-block">CRM / Kanban</span>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {[
            { label: 'Total', value: totalCount },
            { label: 'Watching', value: watchingCount },
            { label: 'Active', value: activeCount },
            { label: 'Closed', value: closedCount },
            { label: 'Passed/Rejected', value: passedCount }
          ].map(stat => (
            <div key={stat.label} className="dossier-card px-6 py-4 flex flex-col items-start gap-2 min-w-[140px]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">{stat.label}</span>
              <span className="font-display text-3xl text-text-primary">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-6 min-h-full items-start">
          {activeColumns.length === 0 && (
            <div className="dossier-card w-full text-center py-16">
              <p className="font-display text-2xl text-text-muted mb-2">Pipeline Empty</p>
              <p className="text-sm text-text-secondary">Save properties from the dashboard to initialize tracking.</p>
            </div>
          )}
          
          {activeColumns.map(stage => (
            <div key={stage} className="flex flex-col gap-4 w-[320px] flex-shrink-0">
              <div className="flex items-center justify-between border-b-2 border-border pb-3">
                <h2 className="text-xs font-bold uppercase tracking-widest text-text-secondary">
                  {formatStage(stage)}
                </h2>
                <span className="font-data text-xs text-accent">
                  {stages[stage].length}
                </span>
              </div>
              <div className="flex flex-col gap-4">
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
