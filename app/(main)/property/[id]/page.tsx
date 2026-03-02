import {
  getProperty,
  getCourtResearch,
  getPipelineEntry,
  getWatchingCount,
  getDealRoom,
  getCurrentUser,
} from '@/lib/queries'
import { notFound } from 'next/navigation'
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils'
import { StageBadge } from '@/components/stage-badge'
import { StageProgress } from '@/components/stage-progress'
import { SaveToPipelineButton } from '@/components/save-to-pipeline-button'
import { PipelineStageSelect } from '@/components/pipeline-stage-select'
import { NotesEditor } from '@/components/notes-editor'
import { GroupNotesEditor } from '@/components/group-notes-editor'

function parseRows(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) return []
  return value.filter((row) => typeof row === 'object' && row !== null) as Array<
    Record<string, unknown>
  >
}

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

  const liens = parseRows(courtResearch?.liens)
  const judgments = parseRows(courtResearch?.judgments)

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,65%)_minmax(0,35%)]">
      <div className="space-y-6">
        <section className="rounded-card border border-border bg-surface p-5">
          <div className="mb-3">
            <StageBadge stage={property.stage} />
          </div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            {property.address}
          </h1>
          <p className="mt-1 text-base text-text-secondary">
            {[property.city, property.state, property.zip_code].filter(Boolean).join(', ')}
          </p>
          <p className="mt-3 font-data text-xs text-text-muted">{property.case_number}</p>
        </section>

        <section className="rounded-card border border-border bg-surface p-5">
          <h2 className="mb-4 font-display text-xl text-text-primary">Property Details</h2>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
            {[
              ['Bedrooms', property.bedrooms],
              ['Bathrooms', property.bathrooms],
              ['Square Feet', formatNumber(property.sqft)],
              ['Property Type', property.property_type],
              ['County Appraisal', formatCurrency(property.county_appraisal)],
              ['Foreclosure Amount', formatCurrency(property.foreclosure_amount)],
              ['Sale Date', formatDate(property.sale_date)],
              ['Attorney', property.attorney_name],
              ['Defendant', property.defendant_name],
            ].map(([label, value]) => (
              <div key={label as string}>
                <dt className="mb-1 text-xs uppercase tracking-[0.08em] text-text-muted">
                  {label}
                </dt>
                <dd className="font-data text-sm text-text-primary">
                  {(value as string | number | null) ?? '--'}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-card border border-border bg-surface p-5">
          <h2 className="mb-4 font-display text-xl text-text-primary">Title &amp; Lien Research</h2>
          {courtResearch ? (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.08em] text-text-muted">
                  Title Status
                </p>
                <span
                  className={`inline-flex rounded-badge border px-2 py-1 text-[10px] uppercase tracking-[0.08em] ${
                    courtResearch.title_status === 'clean'
                      ? 'border-success/40 bg-success/20 text-success'
                      : courtResearch.title_status === 'clouded'
                        ? 'border-warning/40 bg-warning/20 text-warning'
                        : 'border-danger/40 bg-danger/20 text-danger'
                  }`}
                >
                  {courtResearch.title_status?.toUpperCase() ?? 'UNKNOWN'}
                </span>
              </div>

              <div>
                <h3 className="mb-2 text-xs uppercase tracking-[0.08em] text-text-muted">Liens</h3>
                {liens.length === 0 ? (
                  <p className="text-sm text-text-secondary">No lien records available.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs uppercase tracking-[0.08em] text-text-muted">
                          <th className="pb-2">Type</th>
                          <th className="pb-2">Amount</th>
                          <th className="pb-2">Creditor</th>
                          <th className="pb-2">Filing Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {liens.map((lien, i) => (
                          <tr key={i} className="border-b border-border">
                            <td className="py-2 text-text-secondary">
                              {String(lien.type ?? '--')}
                            </td>
                            <td className="py-2 font-data text-text-primary">
                              {String(lien.amount ?? '--')}
                            </td>
                            <td className="py-2 text-text-secondary">
                              {String(lien.creditor ?? '--')}
                            </td>
                            <td className="py-2 font-data text-text-secondary">
                              {String(lien.filing_date ?? '--')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-2 text-xs uppercase tracking-[0.08em] text-text-muted">
                  Judgments
                </h3>
                {judgments.length === 0 ? (
                  <p className="text-sm text-text-secondary">No judgment records available.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs uppercase tracking-[0.08em] text-text-muted">
                          <th className="pb-2">Type</th>
                          <th className="pb-2">Amount</th>
                          <th className="pb-2">Plaintiff</th>
                          <th className="pb-2">Filing Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {judgments.map((judgment, i) => (
                          <tr key={i} className="border-b border-border">
                            <td className="py-2 text-text-secondary">
                              {String(judgment.type ?? '--')}
                            </td>
                            <td className="py-2 font-data text-text-primary">
                              {String(judgment.amount ?? '--')}
                            </td>
                            <td className="py-2 text-text-secondary">
                              {String(judgment.plaintiff ?? '--')}
                            </td>
                            <td className="py-2 font-data text-text-secondary">
                              {String(judgment.filing_date ?? '--')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <p className="font-data text-sm text-text-primary">
                Estimated Bank Ask: {formatCurrency(courtResearch.estimated_offer_min)} -{' '}
                {formatCurrency(courtResearch.estimated_offer_max)}
              </p>

              {courtResearch.research_summary && (
                <p className="rounded-card border border-border bg-bg p-3 text-sm text-text-secondary">
                  {courtResearch.research_summary}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-text-secondary">
              Court research not yet available for this property. This feature is coming in the
              next update.
            </p>
          )}
        </section>

        <section className="rounded-card border border-border bg-surface p-5">
          <h2 className="mb-4 font-display text-xl text-text-primary">Your Notes</h2>
          {pipelineEntry ? (
            <NotesEditor pipelineId={pipelineEntry.id} initialNotes={pipelineEntry.notes ?? ''} />
          ) : (
            <p className="text-sm text-text-secondary">
              Save this property to your pipeline to add notes.
            </p>
          )}
        </section>

        {pipelineEntry?.group_notes && dealRoom && (
          <section className="rounded-card border border-border bg-surface p-5">
            <h2 className="mb-2 font-display text-xl text-text-primary">
              Group Notes from {dealRoom.name}
            </h2>
            <p className="text-sm text-text-secondary">{pipelineEntry.group_notes}</p>
          </section>
        )}
      </div>

      <aside className="space-y-6">
        <section className="rounded-card border border-border bg-surface p-5">
          <h2 className="mb-4 font-display text-xl text-text-primary">Pipeline Status</h2>
          {pipelineEntry?.stage ? (
            <div className="space-y-4">
              <StageProgress currentStage={pipelineEntry.stage} />
              <PipelineStageSelect
                pipelineId={pipelineEntry.id}
                current={pipelineEntry.stage}
              />
            </div>
          ) : (
            <SaveToPipelineButton propertyId={property.id} />
          )}
        </section>

        {watchingCount > 1 && (
          <section className="rounded-card border border-border bg-surface p-5">
            <p className="font-data text-sm text-text-secondary">
              {watchingCount} investors are watching this property
            </p>
          </section>
        )}

        {dealRoom && (
          <section className="rounded-card border border-border bg-surface p-5">
            <h2 className="mb-3 font-display text-xl text-text-primary">Contact Your Agent</h2>
            <p className="text-sm text-text-secondary">{dealRoom.name}</p>
            {dealRoom.contact_email && (
              <a
                href={`mailto:${dealRoom.contact_email}`}
                className="mt-2 block text-sm text-accent hover:text-accent-hover"
              >
                {dealRoom.contact_email}
              </a>
            )}
            {dealRoom.contact_phone && (
              <a
                href={`tel:${dealRoom.contact_phone}`}
                className="mt-1 block font-data text-sm text-text-secondary"
              >
                {dealRoom.contact_phone}
              </a>
            )}
          </section>
        )}

        {(user.role === 'admin' || user.role === 'super_admin') && pipelineEntry && (
          <section className="rounded-card border border-border bg-surface p-5">
            <h2 className="mb-3 font-display text-xl text-text-primary">Admin Group Notes</h2>
            <GroupNotesEditor
              pipelineId={pipelineEntry.id}
              initialValue={pipelineEntry.group_notes ?? ''}
            />
          </section>
        )}
      </aside>
    </div>
  )
}
