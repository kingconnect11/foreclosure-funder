import { getUserPipeline, getCurrentUser } from '@/lib/queries'
import { KanbanBoard } from '@/components/kanban-board'
import { StatCard } from '@/components/stat-card'
import { LayoutList } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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
  const activeStagesList = ['researching', 'site_visit', 'preparing_offer', 'offer_submitted', 'counter_offered', 'offer_accepted', 'in_closing']
  const activeCount = pipeline.filter((e) =>
    activeStagesList.includes(e.stage ?? '')
  ).length
  const closedCount = stages['closed']?.length ?? 0
  const passedCount = (stages['passed']?.length ?? 0) + (stages['rejected']?.length ?? 0) + (stages['no_response']?.length ?? 0)

  return (
    <div className="space-y-8 animate-in fade-in duration-500 flex flex-col h-full">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground mb-6">Pipeline</h1>
        
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Total Saved" value={totalCount} />
          <StatCard label="Watching" value={watchingCount} />
          <StatCard label="Active Deals" value={activeCount} />
          <StatCard label="Closed" value={closedCount} />
          <StatCard label="Passed/Rejected" value={passedCount} />
        </div>
      </div>

      {totalCount === 0 ? (
        <div className="flex-1 rounded-sharp border border-dashed border-border bg-surface-1/50 flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
          <div className="h-16 w-16 rounded-full bg-surface-2 flex items-center justify-center mb-6">
            <LayoutList className="h-8 w-8 text-muted" />
          </div>
          <h2 className="font-serif text-2xl font-semibold mb-2">Your pipeline is empty</h2>
          <p className="text-muted max-w-md mb-8">
            Browse the dashboard to find properties and save them to your pipeline to start tracking your deals.
          </p>
          <Button asChild size="lg">
            <Link href="/dashboard">Browse Properties</Link>
          </Button>
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <KanbanBoard stages={stages} />
        </div>
      )}
    </div>
  )
}
