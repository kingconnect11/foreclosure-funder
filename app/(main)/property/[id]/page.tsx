import {
  getProperty,
  getCourtResearch,
  getPipelineEntry,
  getWatchingCount,
  getDealRoom,
  getCurrentUser,
} from '@/lib/queries'
import { notFound } from 'next/navigation'

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

  // Frontend teams: replace this JSON dump with the two-column layout
  // Data available: property, courtResearch, pipelineEntry, watchingCount, dealRoom, user
  return (
    <div style={{ padding: 24, fontFamily: 'monospace' }}>
      <h1>Property Detail (skeleton)</h1>
      <h2>{property.address}</h2>
      <p>
        {property.city}, {property.state} {property.zip_code}
      </p>
      <h3>Property Data</h3>
      <pre>{JSON.stringify(property, null, 2)}</pre>
      <h3>Court Research</h3>
      <pre>{JSON.stringify(courtResearch, null, 2)}</pre>
      <h3>Pipeline Entry</h3>
      <pre>{JSON.stringify(pipelineEntry, null, 2)}</pre>
      <p>Watching count: {watchingCount}</p>
      {dealRoom && (
        <>
          <h3>Deal Room</h3>
          <pre>{JSON.stringify(dealRoom, null, 2)}</pre>
        </>
      )}
    </div>
  )
}
