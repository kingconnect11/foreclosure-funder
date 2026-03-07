'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import {
  createOwnedProperty,
  deleteOwnedCostItem,
  deleteOwnedProperty,
  importOwnedPropertiesCsv,
  updateOwnedProperty,
  upsertOwnedCostItem,
} from '@/actions/owned'
import type {
  OwnedCostCategory,
  OwnedPropertyCostItemRow,
  OwnedPropertyWithCosts,
} from '@/lib/owned/types'
import { formatCurrency } from '@/lib/utils'
import clsx from 'clsx'

const INITIAL_IMPORT_STATE = {
  success: false,
  message: '',
  importedCount: 0,
  errorRows: [] as string[],
}

type CostFormState = Record<string, { category: OwnedCostCategory; subcategory: string }>

function formatCategory(category: string): string {
  return category
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

interface OwnedTabProps {
  properties: OwnedPropertyWithCosts[]
  targetInvestorId: string
  currentPage: number
  totalPages: number
  prevPageUrl: string | null
  nextPageUrl: string | null
}

export function OwnedTab({
  properties,
  targetInvestorId,
  currentPage,
  totalPages,
  prevPageUrl,
  nextPageUrl,
}: OwnedTabProps) {
  const [importState, importAction, isImportPending] = useActionState(
    importOwnedPropertiesCsv,
    INITIAL_IMPORT_STATE
  )
  const [costFormState, setCostFormState] = useState<CostFormState>({})

  const costDefaults = (propertyId: string) =>
    costFormState[propertyId] ?? { category: 'construction', subcategory: 'general' }

  const setCostDefault = (
    propertyId: string,
    next: { category: OwnedCostCategory; subcategory: string }
  ) => {
    setCostFormState((prev) => ({
      ...prev,
      [propertyId]: next,
    }))
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="font-display text-[22px] text-text-primary">Portfolio Properties</h2>
        {properties.length === 0 && (
          <div className="zen-card p-6 text-sm text-text-muted">
            No portfolio properties yet. Import a CSV or add one manually.
          </div>
        )}

        {properties.map((property) => {
          const defaults = costDefaults(property.id)
          return (
            <details key={property.id} className="zen-card p-4" open>
              <summary className="cursor-pointer list-none flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-semibold text-text-primary">{property.address}</p>
                  <p className="text-xs text-text-muted">
                    {property.city || '--'}, {property.state || '--'} {property.zip_code || ''}
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <p className="text-text-muted">Purchase</p>
                    <p className="font-mono">{formatCurrency(property.purchase_price)}</p>
                  </div>
                  <div>
                    <p className="text-text-muted">Current/Sale</p>
                    <p className="font-mono">
                      {formatCurrency(property.status === 'sold' ? property.sale_price : property.current_value)}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted">Status</p>
                    <p className="uppercase tracking-[0.05em]">{property.status}</p>
                  </div>
                  <div>
                    <p className="text-text-muted">Acquired</p>
                    <p>{property.acquired_at}</p>
                  </div>
                </div>
              </summary>

              <div className="mt-4 grid grid-cols-1 2xl:grid-cols-2 gap-4">
                <form action={updateOwnedProperty} className="grid grid-cols-1 sm:grid-cols-2 gap-3 border border-border rounded p-4">
                  <input type="hidden" name="owned_property_id" value={property.id} />
                  <input name="address" defaultValue={property.address} className="input-zen sm:col-span-2" required />
                  <input name="city" defaultValue={property.city ?? ''} className="input-zen" />
                  <input name="state" defaultValue={property.state ?? ''} className="input-zen" />
                  <input name="zip_code" defaultValue={property.zip_code ?? ''} className="input-zen" />
                  <input name="acquired_at" type="date" defaultValue={property.acquired_at} className="input-zen" required />
                  <select name="status" defaultValue={property.status} className="input-zen">
                    <option value="active">Active</option>
                    <option value="sold">Sold</option>
                  </select>
                  <input name="purchase_price" type="number" step="0.01" min="0" defaultValue={property.purchase_price} className="input-zen" />
                  <input name="current_value" type="number" step="0.01" min="0" defaultValue={property.current_value} className="input-zen" />
                  <input name="sale_price" type="number" step="0.01" min="0" defaultValue={property.sale_price ?? ''} className="input-zen" />
                  <input name="sold_at" type="date" defaultValue={property.sold_at ?? ''} className="input-zen" />
                  <input
                    name="construction_cost_total"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={property.construction_cost_total}
                    className="input-zen"
                  />
                  <input
                    name="legal_fees_total"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={property.legal_fees_total}
                    className="input-zen"
                  />
                  <input
                    name="interest_paid_total"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={property.interest_paid_total}
                    className="input-zen"
                  />
                  <textarea
                    name="notes"
                    defaultValue={property.notes ?? ''}
                    className="input-zen sm:col-span-2 min-h-[88px] resize-y"
                  />
                  <div className="sm:col-span-2 flex flex-wrap gap-2">
                    <button type="submit" className="btn-primary">Save Property</button>
                  </div>
                </form>

                <div className="border border-border rounded p-4 space-y-3">
                  <h4 className="text-[12px] font-medium uppercase tracking-[0.05em] text-text-muted">
                    Cost Items by Subcategory
                  </h4>
                  {(property.owned_property_cost_items ?? []).length === 0 && (
                    <p className="text-xs text-text-muted">No line-item costs yet.</p>
                  )}
                  {(property.owned_property_cost_items ?? []).map((item: OwnedPropertyCostItemRow) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 bg-rice-50 border border-border rounded px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-sm text-text-primary truncate">
                          {formatCategory(item.category)} / {item.subcategory}
                        </p>
                        <p className="text-xs text-text-muted">
                          {item.incurred_on || 'No date'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-text-primary">{formatCurrency(item.amount)}</span>
                        <form action={deleteOwnedCostItem}>
                          <input type="hidden" name="cost_item_id" value={item.id} />
                          <button className="btn-ghost text-xs px-2 py-1" type="submit">Delete</button>
                        </form>
                      </div>
                    </div>
                  ))}

                  <form action={upsertOwnedCostItem} className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    <input type="hidden" name="owned_property_id" value={property.id} />
                    <input type="hidden" name="investor_id" value={property.investor_id} />
                    <select
                      name="category"
                      className="input-zen"
                      value={defaults.category}
                      onChange={(e) =>
                        setCostDefault(property.id, {
                          ...defaults,
                          category: e.target.value as OwnedCostCategory,
                        })
                      }
                    >
                      <option value="construction">Construction</option>
                      <option value="legal">Legal</option>
                      <option value="interest">Interest</option>
                      <option value="taxes">Taxes</option>
                      <option value="insurance">Insurance</option>
                      <option value="hoa">HOA</option>
                      <option value="utilities">Utilities</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                      name="subcategory"
                      placeholder="Subcategory (e.g. framing)"
                      className="input-zen"
                      value={defaults.subcategory}
                      onChange={(e) =>
                        setCostDefault(property.id, {
                          ...defaults,
                          subcategory: e.target.value,
                        })
                      }
                    />
                    <input name="amount" type="number" step="0.01" min="0" placeholder="Amount" className="input-zen" required />
                    <input name="incurred_on" type="date" className="input-zen" />
                    <textarea name="notes" className="input-zen sm:col-span-2 min-h-[72px]" placeholder="Notes (optional)" />
                    <button type="submit" className="btn-secondary sm:col-span-2">Add Cost Item</button>
                  </form>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-border">
                <form action={deleteOwnedProperty}>
                  <input type="hidden" name="owned_property_id" value={property.id} />
                  <button type="submit" className="btn-ghost text-danger px-3 py-2">Delete Property</button>
                </form>
              </div>
            </details>
          )
        })}
      </section>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 py-2">
          {prevPageUrl ? (
            <Link href={prevPageUrl} className="btn-secondary text-sm">Previous</Link>
          ) : (
            <span className="btn-secondary text-sm opacity-40 cursor-not-allowed">Previous</span>
          )}
          <span className="text-sm text-text-secondary">
            Page {currentPage} of {totalPages}
          </span>
          {nextPageUrl ? (
            <Link href={nextPageUrl} className="btn-secondary text-sm">Next</Link>
          ) : (
            <span className="btn-secondary text-sm opacity-40 cursor-not-allowed">Next</span>
          )}
        </div>
      )}

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-6 border-t border-border">
        <div className="zen-card p-5 space-y-4">
          <h2 className="font-display text-[20px] text-text-primary">Upload Portfolio Properties (CSV)</h2>
          <p className="text-[13px] text-text-muted">
            Required columns: <span className="font-mono">address, acquired_at, purchase_price, current_value</span>.
          </p>
          <form action={importAction} className="space-y-3">
            <input type="hidden" name="target_investor_id" value={targetInvestorId} />
            <input
              type="file"
              name="file"
              accept=".csv,text/csv"
              className="input-zen min-h-[44px] file:mr-3 file:px-3 file:py-2 file:rounded file:border-0 file:bg-accent/10 file:text-accent"
              required
            />
            <button
              type="submit"
              disabled={isImportPending}
              className="btn-primary w-full sm:w-auto"
            >
              {isImportPending ? 'Importing...' : 'Import CSV'}
            </button>
          </form>

          {importState.message && (
            <div
              className={clsx(
                'text-sm rounded border px-3 py-2',
                importState.success
                  ? 'bg-success/10 border-success/30 text-success'
                  : 'bg-warning/10 border-warning/30 text-warning-dark'
              )}
            >
              {importState.message}
            </div>
          )}

          {importState.errorRows.length > 0 && (
            <div className="bg-rice-50 border border-border rounded p-3">
              <p className="text-xs font-medium uppercase tracking-[0.05em] text-text-muted mb-2">Import Warnings</p>
              <ul className="space-y-1 text-xs text-text-secondary">
                {importState.errorRows.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="zen-card p-5 space-y-4">
          <h2 className="font-display text-[20px] text-text-primary">Add Portfolio Property</h2>
          <form action={createOwnedProperty} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="hidden" name="target_investor_id" value={targetInvestorId} />
            <input name="address" placeholder="Address*" className="input-zen sm:col-span-2" required />
            <input name="city" placeholder="City" className="input-zen" />
            <input name="state" placeholder="State" className="input-zen" />
            <input name="zip_code" placeholder="ZIP" className="input-zen" />
            <input name="acquired_at" type="date" className="input-zen" required />
            <select name="status" className="input-zen">
              <option value="active">Active</option>
              <option value="sold">Sold</option>
            </select>
            <input name="purchase_price" type="number" step="0.01" min="0" placeholder="Purchase Price" className="input-zen" />
            <input name="current_value" type="number" step="0.01" min="0" placeholder="Current Value" className="input-zen" />
            <input name="sale_price" type="number" step="0.01" min="0" placeholder="Sale Price (if sold)" className="input-zen" />
            <input name="sold_at" type="date" className="input-zen" />
            <input name="construction_cost_total" type="number" step="0.01" min="0" placeholder="Construction Total" className="input-zen" />
            <input name="legal_fees_total" type="number" step="0.01" min="0" placeholder="Legal Fees Total" className="input-zen" />
            <input name="interest_paid_total" type="number" step="0.01" min="0" placeholder="Interest Paid Total" className="input-zen" />
            <textarea
              name="notes"
              placeholder="Notes"
              className="input-zen sm:col-span-2 min-h-[88px] resize-y"
            />
            <button type="submit" className="btn-primary sm:col-span-2">Add Property</button>
          </form>
        </div>
      </section>
    </div>
  )
}
