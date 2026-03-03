import {
  getProperty,
  getCourtResearch,
  getPipelineEntry,
  getWatchingCount,
  getDealRoom,
  getCurrentUser,
} from '@/lib/queries'
import { notFound } from 'next/navigation'
import StageBadge from '@/components/stage-badge'
import { formatCurrency, formatDate } from '@/lib/utils'
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
      getCourtResearch(property.id),
      getPipelineEntry(user.id, property.id),
      getWatchingCount(property.id),
      user.deal_room_id ? getDealRoom(user.deal_room_id) : null,
    ])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-10">
      {/* Left Column */}
      <div className="flex flex-col gap-14">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 mb-2">
            <StageBadge stage={property.stage} />
            <span className="font-data text-xs border border-border px-2 py-0.5 rounded-sm text-text-muted uppercase tracking-widest">{property.case_number}</span>
          </div>
          <h1 className="font-display text-5xl text-text-primary leading-tight">{property.address}</h1>
          <p className="text-lg text-text-secondary font-medium tracking-wide">
            {property.city}, {property.state} {property.zip_code}
          </p>
        </div>

        {/* Property Details */}
        <section className="flex flex-col gap-6">
          <div className="flex items-baseline justify-between ledger-divider pb-2">
            <h2 className="font-display text-3xl text-text-primary">Dossier Details</h2>
            <span className="font-data text-xs text-text-muted uppercase tracking-widest">Core Data</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
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
              <div key={item.label} className="flex justify-between items-end ledger-divider pb-2 border-dashed border-border/50">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{item.label}</span>
                <span className="font-data text-sm text-text-primary text-right">{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Court Research */}
        <section className="flex flex-col gap-6">
          <div className="flex items-baseline justify-between ledger-divider pb-2">
            <h2 className="font-display text-3xl text-text-primary">Title & Lien Research</h2>
            <span className="font-data text-xs text-text-muted uppercase tracking-widest">Public Record</span>
          </div>
          
          <div className="dossier-card p-6">
            {courtResearch ? (
              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Title Status</span>
                  <span className={`inline-block px-3 py-1 rounded-sm text-[10px] tracking-[0.15em] font-bold uppercase border ${
                    courtResearch.title_status === 'clean' ? 'bg-success/10 text-success border-success/20' :
                    courtResearch.title_status === 'clouded' ? 'bg-warning/10 text-warning border-warning/20' :
                    'bg-danger/10 text-danger border-danger/20'
                  }`}>
                    {courtResearch.title_status}
                  </span>
                </div>
                
                <div className="flex justify-between items-end ledger-divider pb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Estimated Bank Ask</span>
                  <span className="font-data text-sm text-accent font-medium">
                    {formatCurrency(courtResearch.estimated_offer_min)} — {formatCurrency(courtResearch.estimated_offer_max)}
                  </span>
                </div>

                {courtResearch.research_summary && (
                  <div className="p-5 border border-border border-dashed rounded-sm text-sm text-text-secondary leading-relaxed bg-background/50">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">Analyst Summary</span>
                    {courtResearch.research_summary}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-text-muted font-medium">Court research not yet available.</p>
                <p className="text-xs text-text-secondary mt-2">Data will be populated prior to auction date.</p>
              </div>
            )}
          </div>
        </section>

        {/* Notes */}
        <section className="flex flex-col gap-6">
          {pipelineEntry ? (
            <PropertyNotes pipelineId={pipelineEntry.id} initialNotes={pipelineEntry.notes} />
          ) : (
            <div>
              <div className="flex items-baseline justify-between ledger-divider pb-2 mb-6">
                <h3 className="font-display text-2xl text-text-primary">Research Notes</h3>
              </div>
              <div className="dossier-card text-center py-12 px-6">
                <p className="text-sm text-text-secondary mb-1">Save this property to your pipeline to unlock notes.</p>
              </div>
            </div>
          )}

          {pipelineEntry?.group_notes && user.role === 'investor' && (
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex items-baseline justify-between ledger-divider pb-2">
                <h3 className="font-display text-2xl text-text-primary">Group Notes</h3>
                <span className="font-data text-xs text-text-muted uppercase tracking-widest">{dealRoom?.name || 'Deal Room'}</span>
              </div>
              <div className="dossier-card p-6 text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
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
      <div className="flex flex-col gap-8">
        <StageProgress propertyId={property.id} pipelineEntry={pipelineEntry} />
        
        {watchingCount > 1 && (
          <div className="flex items-center justify-between p-4 border border-border border-dashed rounded-sm">
            <span className="text-xs font-semibold uppercase tracking-widest text-text-secondary">Market Interest</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
              <span className="font-data text-sm text-text-primary">{watchingCount} tracking</span>
            </div>
          </div>
        )}

        {dealRoom && (
          <div className="dossier-card p-6 flex flex-col gap-5">
            <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
              Agent Contact
            </h3>
            <div className="flex flex-col gap-2">
              <span className="font-display text-xl text-text-primary">{dealRoom.name}</span>
              {dealRoom.contact_email && (
                <a href={`mailto:${dealRoom.contact_email}`} className="text-sm text-accent hover:text-accent-hover transition-colors">
                  {dealRoom.contact_email}
                </a>
              )}
              {dealRoom.contact_phone && (
                <a href={`tel:${dealRoom.contact_phone}`} className="font-data text-sm text-text-secondary hover:text-text-primary transition-colors">
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
