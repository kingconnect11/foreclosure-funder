import { getUserPipeline, getCurrentUser } from '@/lib/queries'
import { PipelineCard, PipelineEntryWithProperty } from '@/components/pipeline-card'
import { PipelineStage } from '@/lib/types'
import Link from 'next/link'
import { Workflow } from 'lucide-react'

const STAGES: PipelineStage[] = [
  'watching', 'researching', 'site_visit', 'preparing_offer', 
  'offer_submitted', 'counter_offered', 'offer_accepted', 
  'in_closing', 'closed', 'rejected', 'no_response', 'passed'
]

const formatStage = (s: string) => s.replace(/_/g, ' ').toUpperCase()

const STAGE_TONES: Record<PipelineStage, { header: string; dot: string }> = {
  watching: { header: 'bg-sky-50 border-sky-200 text-sky-800', dot: 'bg-sky-500' },
  researching: { header: 'bg-indigo-50 border-indigo-200 text-indigo-800', dot: 'bg-indigo-500' },
  site_visit: { header: 'bg-teal-50 border-teal-200 text-teal-800', dot: 'bg-teal-500' },
  preparing_offer: { header: 'bg-amber-50 border-amber-200 text-amber-800', dot: 'bg-amber-500' },
  offer_submitted: { header: 'bg-orange-50 border-orange-200 text-orange-800', dot: 'bg-orange-500' },
  counter_offered: { header: 'bg-rose-50 border-rose-200 text-rose-800', dot: 'bg-rose-500' },
  offer_accepted: { header: 'bg-emerald-50 border-emerald-200 text-emerald-800', dot: 'bg-emerald-500' },
  in_closing: { header: 'bg-lime-50 border-lime-200 text-lime-800', dot: 'bg-lime-500' },
  closed: { header: 'bg-green-50 border-green-200 text-green-800', dot: 'bg-green-600' },
  rejected: { header: 'bg-red-50 border-red-200 text-red-800', dot: 'bg-red-500' },
  no_response: { header: 'bg-zinc-100 border-zinc-300 text-zinc-700', dot: 'bg-zinc-500' },
  passed: { header: 'bg-stone-100 border-stone-300 text-stone-700', dot: 'bg-stone-500' },
}

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

  const hasAnyEntries = pipeline.length > 0

  return (
    <div className="flex flex-col min-h-[calc(100vh-104px)]">
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

      <div className="mb-6 overflow-x-auto pb-1">
        <div className="flex gap-2 min-w-max">
          {STAGES.map((stage) => (
            <div
              key={`pill-${stage}`}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-[0.04em] ${STAGE_TONES[stage].header}`}
            >
              <span className={`h-2 w-2 rounded-full ${STAGE_TONES[stage].dot}`} />
              {formatStage(stage)}
              <span className="font-data">
                {stages[stage]?.length ?? 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 min-h-full items-start">
          {!hasAnyEntries && (
            <div className="zen-card w-full max-w-[520px] p-8 text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-rice-100 flex items-center justify-center">
                <Workflow className="w-6 h-6 text-ink-500" />
              </div>
              <p className="text-text-muted text-sm">
                Your pipeline is empty. Save properties from the dashboard to get started.
              </p>
              <Link href="/dashboard" className="btn-secondary text-sm">
                Browse Dashboard
              </Link>
            </div>
          )}
          
          {STAGES.map(stage => (
            <div key={stage} className="flex flex-col gap-3 w-[250px] sm:w-[270px] flex-shrink-0">
              <div className={`rounded-lg border px-3 py-2 flex items-center justify-between ${STAGE_TONES[stage].header}`}>
                <h2 className="font-body font-semibold text-[11px] uppercase tracking-[0.06em]">
                  {formatStage(stage)}
                </h2>
                <span className="bg-white/70 text-[12px] font-medium px-2 py-0.5 rounded border border-current/20">
                  {stages[stage]?.length ?? 0}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {(stages[stage] ?? []).map(entry => (
                  <PipelineCard key={entry.id} entry={entry as unknown as PipelineEntryWithProperty} />
                ))}
                {!stages[stage]?.length && (
                  <div className="rounded-lg border border-dashed border-border bg-surface px-3 py-4 text-xs text-text-muted">
                    No properties in this stage.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
