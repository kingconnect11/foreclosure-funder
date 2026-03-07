export type OwnedPropertyStatus = 'active' | 'sold'

export type OwnedCostCategory =
  | 'construction'
  | 'legal'
  | 'interest'
  | 'taxes'
  | 'insurance'
  | 'hoa'
  | 'utilities'
  | 'other'

export interface OwnedPropertyRow {
  id: string
  investor_id: string
  deal_room_id: string | null
  source_property_id: string | null
  source_pipeline_id: string | null
  address: string
  city: string | null
  state: string | null
  zip_code: string | null
  acquired_at: string
  status: OwnedPropertyStatus
  purchase_price: number
  sale_price: number | null
  sold_at: string | null
  current_value: number
  construction_cost_total: number
  legal_fees_total: number
  interest_paid_total: number
  notes: string | null
  created_at: string | null
  updated_at: string | null
}

export interface OwnedPropertyCostItemRow {
  id: string
  owned_property_id: string
  investor_id: string
  category: OwnedCostCategory
  subcategory: string
  amount: number
  incurred_on: string | null
  notes: string | null
  created_at: string | null
  updated_at: string | null
}

export interface OwnedPropertyWithCosts extends OwnedPropertyRow {
  owned_property_cost_items: OwnedPropertyCostItemRow[]
}

export interface OwnedKpiSummary {
  totalProfitLoss: number
  ytdProfitLoss: number
  totalConstructionCost: number
  totalLegalFees: number
  totalInterestPaid: number
  totalPortfolioValue: number
  totalCostBasis: number
  realizedProfitLoss: number
  unrealizedProfitLoss: number
  propertyCount: number
}

export interface OwnedTrendPoint {
  month: string
  label: string
  portfolioValue: number
  cumulativeCost: number
  totalProfitLoss: number
}

export interface OwnedCategoryBreakdown {
  category: string
  amount: number
}

export type OwnedChartId = 'value_vs_cost' | 'cost_category_mix' | 'pl_breakdown'

export interface OwnedAnalytics {
  summary: OwnedKpiSummary
  trend: OwnedTrendPoint[]
  categoryBreakdown: OwnedCategoryBreakdown[]
  plBreakdown: Array<{ label: string; value: number }>
}
