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
import { formatCurrency, formatDate, saleDateUrgency } from '@/lib/utils'
import { StageProgress } from '@/components/stage-progress'
import { PropertyNotes } from '@/components/property-notes'
import { AdminGroupNotes } from '@/components/admin-group-notes'
import { AlertTriangle } from 'lucide-react'

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

  const liens = Array.isArray(courtResearch?.liens) ? courtResearch.liens : []
  const judgments = Array.isArray(courtResearch?.judgments) ? courtResearch.judgments : []
  const saleUrgency = saleDateUrgency(property.sale_date)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[66%_34%] gap-6">
      {/* Left Column */}
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="dossier-card p-6 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <StageBadge stage={property.stage} />
            <span className="font-data text-xs border border-border px-2 py-0.5 rounded-lg text-text-muted uppercase tracking-widest">
              {property.case_number}
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-text-primary leading-tight">
            {property.address}
          </h1>
          <p className="text-lg text-text-secondary font-medium">
            {property.city}, {property.state} {property.zip_code}
          </p>
        </div>

        {/* Property Details */}
        <section className="dossier-card p-6 flex flex-col gap-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-3xl text-text-primary">Property Profile</h2>
            <span className="kicker">Core Data</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
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
              <div key={item.label} className="flex justify-between items-end ledger-divider pb-2 border-dashed border-border/50 gap-3">
                <span className="kicker">{item.label}</span>
                <span className="financial-value text-sm text-text-primary text-right">{item.value}</span>
              </div>
            ))}
          </div>
          {property.sale_date ? (
            <div className={`soft-panel px-4 py-3 text-sm ${saleUrgency === 'danger' ? 'border-danger/40' : saleUrgency === 'warning' ? 'border-warning/40' : ''}`}>
              <span className="kicker mr-2">Auction urgency:</span>
              <span className={saleUrgency === 'danger' ? 'text-danger font-semibold' : saleUrgency === 'warning' ? 'text-warning font-semibold' : 'text-text-secondary'}>
                {saleUrgency === 'danger'
                  ? 'Sale date within 14 days'
                  : saleUrgency === 'warning'
                    ? 'Sale date within 30 days'
                    : 'Normal auction timeline'}
              </span>
            </div>
          ) : null}
        </section>

        {/* Court Research */}
        <section className="dossier-card p-6 flex flex-col gap-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-3xl text-text-primary">Title & Lien Research</h2>
            <span className="kicker">Public Record</span>
          </div>

          {courtResearch ? (
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-4">
                <span className="kicker">Title Status</span>
                <span className={`inline-block px-3 py-1 rounded-lg text-[10px] tracking-[0.15em] font-bold uppercase border ${
                  courtResearch.title_status === 'clean' ? 'bg-success/10 text-success border-success/30' :
                  courtResearch.title_status === 'clouded' ? 'bg-warning/10 text-warning border-warning/30' :
                  'bg-danger/10 text-danger border-danger/30'
                }`}>
                  {courtResearch.title_status}
                </span>
              </div>
              
              <div className="flex justify-between items-end ledger-divider pb-2">
                <span className="kicker">Estimated Offer Range</span>
                <span className="financial-value text-sm text-accent font-medium">
                  {formatCurrency(courtResearch.estimated_offer_min)} - {formatCurrency(courtResearch.estimated_offer_max)}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="soft-panel p-4">
                  <p className="kicker mb-2">Liens</p>
                  {liens.length ? (
                    <div className="space-y-2">
                      {liens.map((lien, idx) => {
                        const item = lien as Record<string, unknown>
                        return (
                          <div key={idx} className="ledger-divider pb-2">
                            <p className="text-sm font-semibold text-text-primary">{String(item.type ?? 'Lien')}</p>
                            <p className="text-xs text-text-secondary">
                              {String(item.creditor ?? 'Unknown creditor')} - {formatCurrency(Number(item.amount ?? 0))}
                            </p>
                            <p className="text-xs text-text-muted">
                              Filed {String(item.filing_date ?? '--')}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-text-muted">No lien entries.</p>
                  )}
                </div>

                <div className="soft-panel p-4">
                  <p className="kicker mb-2">Judgments</p>
                  {judgments.length ? (
                    <div className="space-y-2">
                      {judgments.map((judgment, idx) => {
                        const item = judgment as Record<string, unknown>
                        return (
                          <div key={idx} className="ledger-divider pb-2">
                            <p className="text-sm font-semibold text-text-primary">{String(item.type ?? 'Judgment')}</p>
                            <p className="text-xs text-text-secondary">
                              {String(item.plaintiff ?? item.creditor ?? 'Unknown party')} - {formatCurrency(Number(item.amount ?? 0))}
                            </p>
                            <p className="text-xs text-text-muted">
                              Filed {String(item.filing_date ?? '--')}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-text-muted">No judgment entries.</p>
                  )}
                </div>
              </div>

              {courtResearch.research_summary ? (
                <div className="soft-panel p-4 text-sm text-text-secondary leading-relaxed">
                  <span className="block kicker mb-2">Research Summary</span>
                  {courtResearch.research_summary}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="soft-panel p-8 text-center">
              <p className="text-sm text-text-secondary font-medium">
                Court research not yet available for this property.
              </p>
              <p className="text-xs text-text-muted mt-2">
                This section will populate after title and lien review is completed.
              </p>
            </div>
          )}
        </section>

        {/* Notes */}
        <section className="dossier-card p-6 flex flex-col gap-4">
          {pipelineEntry ? (
            <PropertyNotes pipelineId={pipelineEntry.id} initialNotes={pipelineEntry.notes} />
          ) : (
            <div>
              <div className="flex items-baseline justify-between pb-2 mb-4">
                <h3 className="font-display text-2xl text-text-primary">Your Notes</h3>
              </div>
              <div className="soft-panel text-center py-10 px-6">
                <p className="text-sm text-text-secondary mb-1">
                  Save this property to your pipeline to add notes.
                </p>
              </div>
            </div>
          )}

          {pipelineEntry?.group_notes && user.role === 'investor' && (
            <div className="mt-2 flex flex-col gap-4">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-2xl text-text-primary">
                  Group Notes from {dealRoom?.name || 'Deal Room'}
                </h3>
              </div>
              <div className="soft-panel p-4 text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
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
          <div className="soft-panel p-4">
            <div className="flex items-center justify-between">
              <span className="kicker">Market Interest</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                <span className="financial-value text-sm text-text-primary">{watchingCount} watching</span>
              </div>
            </div>
            {watchingCount >= 5 ? (
              <p className="text-xs text-warning mt-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                High investor competition on this property.
              </p>
            ) : null}
          </div>
        )}

        {dealRoom && (
          <div className="dossier-card p-5 flex flex-col gap-5">
            <h3 className="kicker">Contact Your Agent</h3>
            <div className="flex flex-col gap-2">
              <span className="font-display text-xl text-text-primary">{dealRoom.name}</span>
              {dealRoom.contact_email && (
                <a href={`mailto:${dealRoom.contact_email}`} className="text-sm text-accent hover:text-accent-hover transition-colors">
                  {dealRoom.contact_email}
                </a>
              )}
              {dealRoom.contact_phone && (
                <a href={`tel:${dealRoom.contact_phone}`} className="financial-value text-sm text-text-secondary hover:text-text-primary transition-colors">
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
