import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { calculateOwnedAnalytics } from '@/lib/owned/calculations'
import type { OwnedPropertyWithCosts } from '@/lib/owned/types'

const baseProperty: Omit<OwnedPropertyWithCosts, 'id' | 'address' | 'acquired_at' | 'status'> = {
  investor_id: 'investor-1',
  deal_room_id: null,
  source_property_id: null,
  source_pipeline_id: null,
  city: 'Wichita',
  state: 'KS',
  zip_code: '67202',
  purchase_price: 0,
  sale_price: null,
  sold_at: null,
  current_value: 0,
  construction_cost_total: 0,
  legal_fees_total: 0,
  interest_paid_total: 0,
  notes: null,
  created_at: null,
  updated_at: null,
  owned_property_cost_items: [],
}

describe('calculateOwnedAnalytics', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calculates realized and unrealized P/L correctly', () => {
    const properties: OwnedPropertyWithCosts[] = [
      {
        ...baseProperty,
        id: 'p1',
        address: '100 Main St',
        acquired_at: '2026-01-05',
        status: 'active',
        purchase_price: 100000,
        current_value: 145000,
        construction_cost_total: 20000,
        legal_fees_total: 3000,
        interest_paid_total: 4000,
        owned_property_cost_items: [
          {
            id: 'c1',
            owned_property_id: 'p1',
            investor_id: 'investor-1',
            category: 'construction',
            subcategory: 'framing',
            amount: 25000,
            incurred_on: '2026-02-01',
            notes: null,
            created_at: null,
            updated_at: null,
          },
        ],
      },
      {
        ...baseProperty,
        id: 'p2',
        address: '200 Oak Ave',
        acquired_at: '2025-02-01',
        status: 'sold',
        purchase_price: 80000,
        sale_price: 110000,
        sold_at: '2026-03-10',
        current_value: 0,
        construction_cost_total: 10000,
        legal_fees_total: 2000,
        interest_paid_total: 3000,
      },
    ]

    const analytics = calculateOwnedAnalytics(properties)
    expect(analytics.summary.unrealizedProfitLoss).toBe(13000)
    expect(analytics.summary.realizedProfitLoss).toBe(15000)
    expect(analytics.summary.totalProfitLoss).toBe(28000)
    expect(analytics.summary.totalPortfolioValue).toBe(255000)
  })

  it('prefers category line items over aggregate totals', () => {
    const properties: OwnedPropertyWithCosts[] = [
      {
        ...baseProperty,
        id: 'p3',
        address: '300 Elm St',
        acquired_at: '2026-01-01',
        status: 'active',
        purchase_price: 50000,
        current_value: 70000,
        construction_cost_total: 99999,
        legal_fees_total: 1000,
        interest_paid_total: 500,
        owned_property_cost_items: [
          {
            id: 'c2',
            owned_property_id: 'p3',
            investor_id: 'investor-1',
            category: 'construction',
            subcategory: 'tile',
            amount: 10000,
            incurred_on: '2026-01-15',
            notes: null,
            created_at: null,
            updated_at: null,
          },
          {
            id: 'c3',
            owned_property_id: 'p3',
            investor_id: 'investor-1',
            category: 'construction',
            subcategory: 'project_management',
            amount: 5000,
            incurred_on: '2026-02-15',
            notes: null,
            created_at: null,
            updated_at: null,
          },
        ],
      },
    ]

    const analytics = calculateOwnedAnalytics(properties)
    expect(analytics.summary.totalConstructionCost).toBe(15000)

    const constructionBreakdown = analytics.categoryBreakdown.find(
      (row) => row.category === 'construction'
    )
    expect(constructionBreakdown?.amount).toBe(15000)
  })

  it('builds trend and ytd values with transaction-date logic', () => {
    const properties: OwnedPropertyWithCosts[] = [
      {
        ...baseProperty,
        id: 'p4',
        address: '400 Pine St',
        acquired_at: '2026-01-10',
        status: 'active',
        purchase_price: 120000,
        current_value: 150000,
        construction_cost_total: 10000,
        legal_fees_total: 2000,
        interest_paid_total: 1000,
      },
    ]

    const analytics = calculateOwnedAnalytics(properties)
    expect(analytics.trend.length).toBeGreaterThan(0)
    expect(analytics.trend[0].month).toBe('2026-01')
    expect(analytics.summary.ytdProfitLoss).toBe(17000)
  })
})
