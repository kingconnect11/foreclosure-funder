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
    <section className="flex flex-col">
      <div className="mb-8 flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="kicker mb-1">Investor CRM</p>
            <h1 className="font-display text-4xl text-text-primary">Pipeline</h1>
          </div>
          <p className="text-sm text-text-secondary soft-panel px-4 py-2">
            Track progress across all active acquisition stages.
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'Total in Pipeline', value: totalCount },
            { label: 'Watching', value: watchingCount },
            { label: 'Active', value: activeCount },
            { label: 'Closed', value: closedCount },
            { label: 'Passed/Rejected', value: passedCount }
          ].map(stat => (
            <div key={stat.label} className="dossier-card px-4 py-4 flex flex-col items-start gap-2 min-w-[140px]">
              <span className="kicker">{stat.label}</span>
              <span className="font-display text-3xl text-text-primary">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-2">
        <div className="flex gap-6 min-h-full items-start">
          {activeColumns.length === 0 && (
            <div className="dossier-card w-full text-center py-16 px-4">
              <p className="font-display text-3xl text-text-primary mb-2">Your pipeline is empty</p>
              <p className="text-sm text-text-secondary">
                Your pipeline is empty. Browse the dashboard to save your first property.
              </p>
            </div>
          )}
          
          {activeColumns.map(stage => (
            <div key={stage} className="soft-panel p-3 flex flex-col gap-4 w-[320px] flex-shrink-0">
              <div className="flex items-center justify-between pb-2 border-b border-border border-dashed">
                <h2 className="kicker">
                  {formatStage(stage)}
                </h2>
                <span className="financial-value text-xs text-accent">
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
    </section>
  )
}
