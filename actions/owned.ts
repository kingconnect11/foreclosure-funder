'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { OwnedChartId, OwnedCostCategory, OwnedPropertyStatus } from '@/lib/owned/types'

interface ImportOwnedState {
  success: boolean
  message: string
  importedCount: number
  errorRows: string[]
}

const DEFAULT_IMPORT_STATE: ImportOwnedState = {
  success: false,
  message: '',
  importedCount: 0,
  errorRows: [],
}

const OWNED_STATUSES: OwnedPropertyStatus[] = ['active', 'sold']
const COST_CATEGORIES: OwnedCostCategory[] = [
  'construction',
  'legal',
  'interest',
  'taxes',
  'insurance',
  'hoa',
  'utilities',
  'other',
]

function revalidatePortfolioPaths() {
  revalidatePath('/portfolio')
  revalidatePath('/owned')
}

type ViewerProfile = {
  id: string
  role: 'investor' | 'admin' | 'super_admin'
  deal_room_id: string | null
}

type InvestorProfile = {
  id: string
  deal_room_id: string | null
}

type UntypedQueryBuilder = any

function toNumber(value: FormDataEntryValue | null, fallback = 0): number {
  if (typeof value !== 'string' || value.trim() === '') return fallback
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return parsed
}

function getString(value: FormDataEntryValue | null): string {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function getNullableString(value: FormDataEntryValue | null): string | null {
  const normalized = getString(value)
  return normalized.length > 0 ? normalized : null
}

function normalizeStatus(value: string): OwnedPropertyStatus {
  return OWNED_STATUSES.includes(value as OwnedPropertyStatus)
    ? (value as OwnedPropertyStatus)
    : 'active'
}

function normalizeCategory(value: string): OwnedCostCategory {
  return COST_CATEGORIES.includes(value as OwnedCostCategory)
    ? (value as OwnedCostCategory)
    : 'other'
}

function isValidIsoDate(value: string): boolean {
  if (!value) return false
  const parsed = new Date(value)
  return !Number.isNaN(parsed.getTime())
}

function validateOwnedPayload(input: {
  status: OwnedPropertyStatus
  acquiredAt: string
  soldAt: string | null
  purchasePrice: number
  currentValue: number
  salePrice: number | null
}) {
  if (!isValidIsoDate(input.acquiredAt)) {
    throw new Error('Acquired date must be a valid date')
  }
  if (input.purchasePrice < 0 || input.currentValue < 0) {
    throw new Error('Purchase and current value must be non-negative')
  }
  if (input.status === 'sold') {
    if (input.salePrice === null || input.salePrice <= 0) {
      throw new Error('Sold properties require a valid sale price')
    }
    if (!input.soldAt || !isValidIsoDate(input.soldAt)) {
      throw new Error('Sold properties require a sold date')
    }
    const acquired = new Date(input.acquiredAt)
    const sold = new Date(input.soldAt)
    if (sold < acquired) {
      throw new Error('Sold date cannot be before acquired date')
    }
  }
}

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    const next = line[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  values.push(current.trim())
  return values
}

function parseCsv(text: string): Array<Record<string, string>> {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length <= 1) return []

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase())
  const rows: Array<Record<string, string>> = []

  for (let i = 1; i < lines.length; i += 1) {
    const cells = parseCsvLine(lines[i])
    const row: Record<string, string> = {}
    headers.forEach((header, idx) => {
      row[header] = cells[idx] ?? ''
    })
    rows.push(row)
  }

  return rows
}

async function getViewerProfile(userId: string): Promise<ViewerProfile> {
  const supabase = await createClient()
  const db = supabase as unknown as {
    from: (table: string) => UntypedQueryBuilder
  }

  const { data, error } = await db
    .from('profiles')
    .select('id, role, deal_room_id')
    .eq('id', userId)
    .single()

  if (error || !data) throw new Error('Unable to load user profile')
  return data as ViewerProfile
}

async function resolveTargetInvestorId(
  viewer: ViewerProfile,
  requestedInvestorId: string | null
): Promise<InvestorProfile> {
  const supabase = await createClient()
  const db = supabase as unknown as {
    from: (table: string) => UntypedQueryBuilder
  }

  if (viewer.role === 'investor') {
    return {
      id: viewer.id,
      deal_room_id: viewer.deal_room_id,
    }
  }

  const targetId = requestedInvestorId?.trim() || viewer.id
  const { data, error } = await db
    .from('profiles')
    .select('id, deal_room_id, role')
    .eq('id', targetId)
    .single()

  if (error || !data) throw new Error('Target investor not found')

  const target = data as InvestorProfile & { role: 'investor' | 'admin' | 'super_admin' }
  if (viewer.role !== 'super_admin') {
    if (!viewer.deal_room_id || viewer.deal_room_id !== target.deal_room_id) {
      throw new Error('Admins can only manage investors in their deal room')
    }
    if (target.role !== 'investor') {
      throw new Error('Admins can only manage investor-owned properties')
    }
  }

  return {
    id: target.id,
    deal_room_id: target.deal_room_id,
  }
}

export async function createOwnedProperty(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as unknown as {
    from: (table: string) => UntypedQueryBuilder
  }
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const viewer = await getViewerProfile(user.id)
  const target = await resolveTargetInvestorId(
    viewer,
    getNullableString(formData.get('target_investor_id'))
  )

  const address = getString(formData.get('address'))
  if (!address) throw new Error('Address is required')

  const status = normalizeStatus(getString(formData.get('status')))
  const acquiredAt = getString(formData.get('acquired_at'))
  if (!acquiredAt) throw new Error('Acquired date is required')
  const purchasePrice = toNumber(formData.get('purchase_price'))
  const currentValue = toNumber(formData.get('current_value'))
  const salePrice = status === 'sold' ? toNumber(formData.get('sale_price')) : null
  const soldAt = status === 'sold' ? getNullableString(formData.get('sold_at')) : null
  validateOwnedPayload({
    status,
    acquiredAt,
    soldAt,
    purchasePrice,
    currentValue,
    salePrice,
  })

  const payload = {
    investor_id: target.id,
    deal_room_id: target.deal_room_id,
    source_property_id: getNullableString(formData.get('source_property_id')),
    source_pipeline_id: getNullableString(formData.get('source_pipeline_id')),
    address,
    city: getNullableString(formData.get('city')),
    state: getNullableString(formData.get('state')),
    zip_code: getNullableString(formData.get('zip_code')),
    acquired_at: acquiredAt,
    status,
    purchase_price: purchasePrice,
    current_value: currentValue,
    sale_price: salePrice,
    sold_at: soldAt,
    construction_cost_total: toNumber(formData.get('construction_cost_total')),
    legal_fees_total: toNumber(formData.get('legal_fees_total')),
    interest_paid_total: toNumber(formData.get('interest_paid_total')),
    notes: getNullableString(formData.get('notes')),
  }

  const { error } = await db.from('owned_properties').insert(payload)
  if (error) throw error

  revalidatePortfolioPaths()
  revalidatePath('/dashboard')
}

export async function updateOwnedProperty(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as unknown as {
    from: (table: string) => UntypedQueryBuilder
  }
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const id = getString(formData.get('owned_property_id'))
  if (!id) throw new Error('Owned property id is required')
  const status = normalizeStatus(getString(formData.get('status')))
  const acquiredAt = getString(formData.get('acquired_at'))
  const purchasePrice = toNumber(formData.get('purchase_price'))
  const currentValue = toNumber(formData.get('current_value'))
  const salePrice = status === 'sold' ? toNumber(formData.get('sale_price')) : null
  const soldAt = status === 'sold' ? getNullableString(formData.get('sold_at')) : null
  validateOwnedPayload({
    status,
    acquiredAt,
    soldAt,
    purchasePrice,
    currentValue,
    salePrice,
  })

  const payload = {
    address: getString(formData.get('address')),
    city: getNullableString(formData.get('city')),
    state: getNullableString(formData.get('state')),
    zip_code: getNullableString(formData.get('zip_code')),
    acquired_at: acquiredAt,
    status,
    purchase_price: purchasePrice,
    current_value: currentValue,
    sale_price: salePrice,
    sold_at: soldAt,
    construction_cost_total: toNumber(formData.get('construction_cost_total')),
    legal_fees_total: toNumber(formData.get('legal_fees_total')),
    interest_paid_total: toNumber(formData.get('interest_paid_total')),
    notes: getNullableString(formData.get('notes')),
  }

  const { error } = await db
    .from('owned_properties')
    .update(payload)
    .eq('id', id)

  if (error) throw error

  revalidatePortfolioPaths()
  revalidatePath('/dashboard')
}

export async function deleteOwnedProperty(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as unknown as {
    from: (table: string) => UntypedQueryBuilder
  }
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const id = getString(formData.get('owned_property_id'))
  if (!id) throw new Error('Owned property id is required')

  const { error } = await db
    .from('owned_properties')
    .delete()
    .eq('id', id)

  if (error) throw error

  revalidatePortfolioPaths()
  revalidatePath('/dashboard')
}

export async function importOwnedPropertiesCsv(
  _prevState: ImportOwnedState,
  formData: FormData
): Promise<ImportOwnedState> {
  const supabase = await createClient()
  const db = supabase as unknown as {
    from: (table: string) => UntypedQueryBuilder
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return {
      ...DEFAULT_IMPORT_STATE,
      message: 'Not authenticated',
    }
  }

  const viewer = await getViewerProfile(user.id)
  const target = await resolveTargetInvestorId(
    viewer,
    getNullableString(formData.get('target_investor_id'))
  )

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return {
      ...DEFAULT_IMPORT_STATE,
      message: 'Please upload a CSV file.',
    }
  }

  const csvText = await file.text()
  const rows = parseCsv(csvText)
  if (rows.length === 0) {
    return {
      ...DEFAULT_IMPORT_STATE,
      message: 'No rows found. Ensure the CSV has a header and at least one row.',
    }
  }

  const inserts: Record<string, unknown>[] = []
  const errorRows: string[] = []

  rows.forEach((row, index) => {
    const rowNumber = index + 2
    const address = (row.address ?? '').trim()
    const acquiredAt = (row.acquired_at ?? '').trim()
    if (!address || !acquiredAt) {
      errorRows.push(`Row ${rowNumber}: address and acquired_at are required`)
      return
    }

    const status = normalizeStatus((row.status ?? '').trim() || 'active')
    const purchasePrice = Number(row.purchase_price ?? 0)
    const currentValue = Number(row.current_value ?? 0)
    if (!Number.isFinite(purchasePrice) || !Number.isFinite(currentValue)) {
      errorRows.push(`Row ${rowNumber}: purchase_price and current_value must be numbers`)
      return
    }

    const salePriceRaw = (row.sale_price ?? '').trim()
    const soldAtRaw = (row.sold_at ?? '').trim()
    if (status === 'sold' && (!salePriceRaw || !soldAtRaw)) {
      errorRows.push(`Row ${rowNumber}: sold status requires sale_price and sold_at`)
      return
    }

    inserts.push({
      investor_id: target.id,
      deal_room_id: target.deal_room_id,
      address,
      city: (row.city ?? '').trim() || null,
      state: (row.state ?? '').trim() || null,
      zip_code: (row.zip_code ?? '').trim() || null,
      acquired_at: acquiredAt,
      status,
      purchase_price: purchasePrice,
      current_value: currentValue,
      sale_price: salePriceRaw ? Number(salePriceRaw) : null,
      sold_at: soldAtRaw || null,
      construction_cost_total: Number(row.construction_cost_total ?? 0) || 0,
      legal_fees_total: Number(row.legal_fees_total ?? 0) || 0,
      interest_paid_total: Number(row.interest_paid_total ?? 0) || 0,
      notes: (row.notes ?? '').trim() || null,
    })
  })

  if (inserts.length > 0) {
    const { error } = await db.from('owned_properties').insert(inserts)
    if (error) {
      return {
        ...DEFAULT_IMPORT_STATE,
        message: 'Import failed. Please verify data and try again.',
        errorRows: errorRows.length > 0 ? errorRows : [error.message],
      }
    }
  }

  revalidatePortfolioPaths()
  revalidatePath('/dashboard')

  return {
    success: inserts.length > 0,
    message:
      inserts.length > 0
        ? `Imported ${inserts.length} properties.`
        : 'No valid rows to import.',
    importedCount: inserts.length,
    errorRows,
  }
}

export async function upsertOwnedCostItem(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as unknown as {
    from: (table: string) => UntypedQueryBuilder
  }
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const ownedPropertyId = getString(formData.get('owned_property_id'))
  if (!ownedPropertyId) throw new Error('Owned property id is required')

  const payload = {
    id: getNullableString(formData.get('cost_item_id')) ?? undefined,
    owned_property_id: ownedPropertyId,
    investor_id: getString(formData.get('investor_id')),
    category: normalizeCategory(getString(formData.get('category'))),
    subcategory: getString(formData.get('subcategory')) || 'general',
    amount: toNumber(formData.get('amount')),
    incurred_on: getNullableString(formData.get('incurred_on')),
    notes: getNullableString(formData.get('notes')),
  }

  if (!payload.investor_id) throw new Error('Investor id is required')
  if (payload.amount < 0) throw new Error('Amount cannot be negative')

  const { error } = await db
    .from('owned_property_cost_items')
    .upsert(payload, { onConflict: 'id' })

  if (error) throw error

  revalidatePortfolioPaths()
}

export async function deleteOwnedCostItem(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as unknown as {
    from: (table: string) => UntypedQueryBuilder
  }
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const id = getString(formData.get('cost_item_id'))
  if (!id) throw new Error('Cost item id is required')

  const { error } = await db
    .from('owned_property_cost_items')
    .delete()
    .eq('id', id)

  if (error) throw error
  revalidatePortfolioPaths()
}

export async function updateOwnedChartPreferences(pinnedChartIds: OwnedChartId[]) {
  const supabase = await createClient()
  const db = supabase as unknown as {
    from: (table: string) => UntypedQueryBuilder
  }
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const deduped = Array.from(new Set(pinnedChartIds)).slice(0, 5)
  const { error } = await db.from('owned_chart_preferences').upsert(
    {
      user_id: user.id,
      pinned_chart_ids: deduped,
    },
    { onConflict: 'user_id' }
  )

  if (error) throw error
  revalidatePortfolioPaths()
}

export async function backfillClosedPipelineToOwned(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as unknown as {
    from: (table: string) => UntypedQueryBuilder
  }
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const viewer = await getViewerProfile(user.id)
  const target = await resolveTargetInvestorId(
    viewer,
    getNullableString(formData.get('target_investor_id'))
  )

  const { data, error } = await db
    .from('investor_pipeline')
    .select(
      `
      id,
      investor_id,
      property_id,
      deal_room_id,
      moved_to_owned_at,
      properties (
        address,
        city,
        state,
        zip_code,
        foreclosure_amount,
        county_appraisal
      )
    `
    )
    .eq('investor_id', target.id)
    .eq('stage', 'closed')
    .is('moved_to_owned_at', null)

  if (error) throw error

  const rows = (data ?? []) as Array<{
    id: string
    property_id: string | null
    deal_room_id: string | null
    properties: {
      address: string | null
      city: string | null
      state: string | null
      zip_code: string | null
      foreclosure_amount: number | null
      county_appraisal: number | null
    } | null
  }>

  if (rows.length === 0) {
    revalidatePortfolioPaths()
    return
  }

  const inserts = rows.map((row) => {
    const property = row.properties ?? null
    return {
      investor_id: target.id,
      deal_room_id: row.deal_room_id,
      source_property_id: row.property_id,
      source_pipeline_id: row.id,
      address: property?.address ?? 'Unknown Address',
      city: property?.city ?? null,
      state: property?.state ?? null,
      zip_code: property?.zip_code ?? null,
      acquired_at: new Date().toISOString().slice(0, 10),
      status: 'active',
      purchase_price: Number(property?.foreclosure_amount ?? 0) || 0,
      current_value: Number(property?.county_appraisal ?? 0) || 0,
      construction_cost_total: 0,
      legal_fees_total: 0,
      interest_paid_total: 0,
    }
  })

  const { error: insertError } = await db
    .from('owned_properties')
    .upsert(inserts, { onConflict: 'source_pipeline_id' })
  if (insertError) throw insertError

  const pipelineIds = rows.map((row) => row.id)
  const { error: updateError } = await db
    .from('investor_pipeline')
    .update({ moved_to_owned_at: new Date().toISOString() })
    .in('id', pipelineIds)
  if (updateError) throw updateError

  revalidatePortfolioPaths()
  revalidatePath('/pipeline')
  revalidatePath('/dashboard')
}
