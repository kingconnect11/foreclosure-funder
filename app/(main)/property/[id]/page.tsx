import {
  getProperty,
  getCourtResearch,
  getPipelineEntry,
  getWatchingCount,
  getDealRoom,
  getCurrentUser,
} from '@/lib/queries'
import { notFound } from 'next/navigation'
import { PropertyHeader } from '@/components/property-header'
import { PropertyDetailsGrid } from '@/components/property-details-grid'
import { CourtResearchSection } from '@/components/court-research'
import { NotesSection } from '@/components/notes-section'
import { PipelineStatusCard } from '@/components/pipeline-status-card'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return null

  const property = await getProperty(id)
  if (!property) notFound()

  const [courtResearch, pipelineEntry, watchingCount, dealRoom] =
    await Promise.all([
      getCourtResearch(property.id),
      getPipelineEntry(user.id, property.id),
      getWatchingCount(property.id),
      user.deal_room_id ? getDealRoom(user.deal_room_id) : null,
    ])

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center text-sm text-muted hover:text-foreground mb-6 transition-colors">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Primary Content (8 columns) */}
        <div className="lg:col-span-8">
          <PropertyHeader property={property} />
          <PropertyDetailsGrid property={property} />
          <CourtResearchSection research={courtResearch} />
          <NotesSection 
            pipelineId={pipelineEntry?.id} 
            initialNotes={pipelineEntry?.notes} 
            groupNotes={pipelineEntry?.group_notes}
            dealRoomName={dealRoom?.name}
          />
        </div>

        {/* Right Column - Sidebar (4 columns) */}
        <div className="lg:col-span-4">
          <div className="sticky top-6">
            <PipelineStatusCard 
              propertyId={property.id}
              pipelineEntry={pipelineEntry ? { id: pipelineEntry.id, stage: pipelineEntry.stage } : null}
              watchingCount={watchingCount}
              dealRoom={dealRoom}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
