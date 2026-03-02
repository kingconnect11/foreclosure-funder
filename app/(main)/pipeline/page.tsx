import { getUserPipeline, getCurrentUser } from '@/lib/queries'
import { PipelineCard } from '@/components/pipeline-card'

const STAGE_LABELS: Record<string, string> = {
  watching: 'Watching',
  researching: 'Researching',
  site_visit: 'Site Visit',
  preparing_offer: 'Preparing Offer',
  offer_submitted: 'Offer Submitted',
  counter_offered: 'Counter-Offered',
  offer_accepted: 'Offer Accepted',
  in_closing: 'In Closing',
  closed: 'Closed',
  rejected: 'Rejected',
  no_response: 'No Response',
  passed: 'Passed',
}

export default async function PipelinePage() {
  const user = await getCurrentUser()
  if (!user) return null

  const pipeline = await getUserPipeline(user.id)

  // Group by stage for kanban layout
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

  const orderedStageKeys = Object.keys(stages).sort((a, b) => {
    const all = Object.keys(STAGE_LABELS)
    return all.indexOf(a) - all.indexOf(b)
  })

  return (
    <div className="space-y-8">
      <section>
        <h1 className="mb-6 font-display text-[28px] font-bold leading-[1.2] text-text-primary">
          Your Pipeline
        </h1>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {[
            ['Total in Pipeline', totalCount],
            ['Watching', watchingCount],
            ['Active', activeCount],
            ['Closed', closedCount],
            ['Passed/Rejected', passedCount],
          ].map(([label, value]) => (
            <article key={label as string} className="rounded-card border border-border bg-surface p-4">
              <p className="mb-2 text-[11px] uppercase tracking-[0.08em] text-text-muted">
                {label}
              </p>
              <p className="font-data text-2xl text-text-primary">{value as number}</p>
            </article>
          ))}
        </div>
      </section>

      {pipeline.length === 0 ? (
        <p className="rounded-card border border-border bg-surface p-6 text-sm text-text-secondary">
          Pipeline is empty.
        </p>
      ) : (
        <section className="overflow-x-auto pb-2">
          <div className="flex min-w-max gap-4">
            {orderedStageKeys.map((stage) => (
              <div
                key={stage}
                className="w-[320px] rounded-card border border-border bg-bg p-3"
              >
                <header className="mb-3 flex items-center justify-between border-b border-border pb-2">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-text-secondary">
                    {STAGE_LABELS[stage] ?? stage}
                  </h2>
                  <span className="rounded-badge border border-border px-2 py-1 font-data text-[11px] text-text-primary">
                    {stages[stage].length}
                  </span>
                </header>
                <div className="space-y-3">
                  {stages[stage].map((entry) => (
                    <PipelineCard key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
