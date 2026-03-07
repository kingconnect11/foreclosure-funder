import {
  getProperty,
  getCourtResearch,
  getPipelineEntry,
  getWatchingCount,
  getDealRoom,
  getCurrentUser,
  getStageHistory,
} from '@/lib/queries'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import StageBadge from '@/components/stage-badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Calculator } from 'lucide-react'
import { StageProgress } from '@/components/stage-progress'
import { PropertyNotes } from '@/components/property-notes'
import { AdminGroupNotes } from '@/components/admin-group-notes'

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
      getCourtResearch(property.id).catch(() => null),
      getPipelineEntry(user.id, property.id).catch(() => null),
      getWatchingCount(property.id).catch(() => 0),
      user.deal_room_id ? getDealRoom(user.deal_room_id).catch(() => null) : null,
    ])

  // Second pass — needs pipeline entry ID
  const stageHistory = pipelineEntry
    ? await getStageHistory(pipelineEntry.id).catch(() => [])
    : []

  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-8">
      {/* Left Column */}
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 mb-1">
            <StageBadge stage={property.stage} />
            <span className="font-data text-[13px] text-text-muted">{property.case_number}</span>
          </div>
          <h1 className="font-display font-bold text-[28px] text-text-primary leading-[1.2]">{property.address}</h1>
          <p className="text-[16px] text-text-secondary">
            {property.city}, {property.state} {property.zip_code}
          </p>
        </div>

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-[20px] text-text-primary">Property Details</h2>
          <div className="bg-surface border border-border rounded p-5">
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              {[
                { label: 'Bedrooms', value: property.bedrooms ?? '--' },
                { label: 'Bathrooms', value: property.bathrooms ?? '--' },
                { label: 'Square Feet', value: property.sqft ?? '--' },
                { label: 'Property Type', value: property.property_type ?? '--' },
                { label: 'County Appraisal', value: formatCurrency(property.county_appraisal) },
                { label: 'Foreclosure Amount', value: formatCurrency(property.foreclosure_amount) },
                { label: 'Sale Date', value: formatDate(property.sale_date) },
                { label: 'Attorney', value: property.attorney_name ?? '--' },
                { label: 'Defendant', value: property.defendant_name ?? '--' },
              ].map(item => (
                <div key={item.label} className="flex flex-col gap-1">
                  <span className="text-[12px] font-medium uppercase tracking-[0.05em] text-text-muted">{item.label}</span>
                  <span className="font-data text-[14px] text-text-primary">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Link
          href={`/deal-analyzer?propertyId=${property.id}`}
          className="btn-primary inline-flex items-center gap-2 self-start"
        >
          <Calculator className="w-4 h-4" />
          Analyze This Deal
        </Link>

        {googleMapsKey && property.address && property.city && property.state && property.zip_code && (
          <section className="flex flex-col gap-4">
            <h2 className="font-display text-[20px] text-text-primary">Location</h2>
            <div className="bg-surface border border-border rounded overflow-hidden">
              <iframe
                width="100%"
                height="250"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsKey}&q=${encodeURIComponent(
                  `${property.address}, ${property.city}, ${property.state} ${property.zip_code}`
                )}`}
              />
            </div>
          </section>
        )}

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-[20px] text-text-primary">Title & Lien Research</h2>
          <div className="bg-surface border border-border rounded p-5">
            {courtResearch ? (
              <div className="flex flex-col gap-6">
                <div>
                  <span className={`inline-block px-[8px] py-[3px] rounded-[2px] text-[10px] tracking-[0.08em] font-medium uppercase border ${
                    courtResearch.title_status === 'clean' ? 'bg-success/10 text-success border-success/20' :
                    courtResearch.title_status === 'clouded' ? 'bg-warning/10 text-warning border-warning/20' :
                    'bg-danger/10 text-danger border-danger/20'
                  }`}>
                    {courtResearch.title_status} TITLE
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[12px] font-medium uppercase tracking-[0.05em] text-text-muted">Estimated Offer Range</span>
                  <span className="font-data text-[14px] text-text-primary">
                    Estimated Bank Ask: {formatCurrency(courtResearch.estimated_offer_min)} - {formatCurrency(courtResearch.estimated_offer_max)}
                  </span>
                </div>

                {courtResearch.research_summary && (
                  <div className="p-4 border border-border rounded text-[14px] text-text-primary bg-background">
                    {courtResearch.research_summary}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[14px] text-text-muted">
                Court research not yet available for this property. This feature is coming in the next update.
              </p>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          {pipelineEntry ? (
            <PropertyNotes pipelineId={pipelineEntry.id} initialNotes={pipelineEntry.notes} />
          ) : (
            <div className="flex flex-col gap-2">
              <h3 className="text-[20px] font-display text-text-primary">Your Notes</h3>
              <div className="bg-surface border border-border rounded p-5 text-center text-text-muted text-sm">
                Save this property to your pipeline to add notes.
              </div>
            </div>
          )}

          {pipelineEntry?.group_notes && user.role === 'investor' && (
            <div className="mt-4 flex flex-col gap-2">
              <h3 className="text-[14px] font-semibold text-text-secondary uppercase tracking-wide">
                Group Notes from {dealRoom?.name || 'Deal Room'}
              </h3>
              <div className="bg-surface border border-border rounded p-4 text-[14px] text-text-primary whitespace-pre-wrap">
                {pipelineEntry.group_notes}
              </div>
            </div>
          )}

          {(user.role === 'admin' || user.role === 'super_admin') && pipelineEntry && (
            <AdminGroupNotes pipelineId={pipelineEntry.id} initialNotes={pipelineEntry.group_notes} />
          )}
        </section>
      </div>

      {/* Right Column */}
      <div className="flex flex-col gap-6">
        <StageProgress
          propertyId={property.id}
          pipelineEntry={pipelineEntry}
          stageHistory={stageHistory}
          propertyPrefill={{
            address: property.address ?? null,
            city: property.city ?? null,
            state: property.state ?? null,
            zipCode: property.zip_code ?? null,
            purchasePrice:
              property.foreclosure_amount !== null && property.foreclosure_amount !== undefined
                ? Number(property.foreclosure_amount)
                : null,
            currentValue:
              property.county_appraisal !== null && property.county_appraisal !== undefined
                ? Number(property.county_appraisal)
                : null,
          }}
        />

        {watchingCount > 1 && (
          <div className="bg-surface border border-border rounded p-4 flex items-center justify-center gap-2 text-text-secondary text-sm">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            {watchingCount} investors are watching this property
          </div>
        )}

        {dealRoom && (
          <div className="bg-surface border border-border rounded p-5 flex flex-col gap-4">
            <h3 className="text-[12px] font-medium uppercase tracking-[0.05em] text-text-muted">
              Contact Your Agent
            </h3>
            <div className="flex flex-col gap-1">
              <span className="font-body font-semibold text-[15px] text-text-primary">{dealRoom.name}</span>
              {dealRoom.contact_email && (
                <a href={`mailto:${dealRoom.contact_email}`} className="text-[14px] text-accent hover:text-accent-hover transition-colors">
                  {dealRoom.contact_email}
                </a>
              )}
              {dealRoom.contact_phone && (
                <a href={`tel:${dealRoom.contact_phone}`} className="font-data text-[14px] text-text-secondary hover:text-text-primary transition-colors">
                  {dealRoom.contact_phone}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
