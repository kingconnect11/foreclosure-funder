import { getUserPipeline, getCurrentUser } from '@/lib/queries'

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

  // Frontend teams: replace this JSON dump with kanban board
  // Data available: pipeline, stages, stats (totalCount, watchingCount, activeCount, closedCount, passedCount), user
  return (
    <div style={{ padding: 24, fontFamily: 'monospace' }}>
      <h1>Pipeline (skeleton)</h1>
      <h2>Summary</h2>
      <pre>
        {JSON.stringify(
          { totalCount, watchingCount, activeCount, closedCount, passedCount },
          null,
          2
        )}
      </pre>
      <h2>Stages</h2>
      {Object.entries(stages).map(([stage, entries]) => (
        <div key={stage}>
          <h3>
            {stage} ({entries.length})
          </h3>
          <pre>{JSON.stringify(entries.slice(0, 2), null, 2)}</pre>
        </div>
      ))}
    </div>
  )
}
