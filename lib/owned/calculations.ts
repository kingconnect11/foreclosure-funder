import { endOfMonth, format, isAfter, isBefore, parseISO, startOfMonth } from 'date-fns'
import type {
  OwnedAnalytics,
  OwnedCategoryBreakdown,
  OwnedCostCategory,
  OwnedKpiSummary,
  OwnedPropertyCostItemRow,
  OwnedPropertyWithCosts,
  OwnedTrendPoint,
} from '@/lib/owned/types'

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

function toSafeNumber(value: number | null | undefined): number {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) return 0
  return value
}

function parseDateOrNull(value: string | null | undefined): Date | null {
  if (!value) return null
  const parsed = parseISO(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

function sumLineItems(
  items: OwnedPropertyCostItemRow[],
  category: OwnedCostCategory,
  upToDate?: Date
): number {
  return items
    .filter((item) => item.category === category)
    .filter((item) => {
      if (!upToDate) return true
      const incurredDate = parseDateOrNull(item.incurred_on)
      if (!incurredDate) return true
      return !isAfter(incurredDate, upToDate)
    })
    .reduce((sum, item) => sum + toSafeNumber(item.amount), 0)
}

function getAggregateForCategory(property: OwnedPropertyWithCosts, category: OwnedCostCategory): number {
  if (category === 'construction') return toSafeNumber(property.construction_cost_total)
  if (category === 'legal') return toSafeNumber(property.legal_fees_total)
  if (category === 'interest') return toSafeNumber(property.interest_paid_total)
  return 0
}

function getEffectiveCategoryTotal(
  property: OwnedPropertyWithCosts,
  category: OwnedCostCategory,
  upToDate?: Date
): number {
  const lineItems = sumLineItems(property.owned_property_cost_items ?? [], category, upToDate)
  const hasLineItems = (property.owned_property_cost_items ?? []).some((item) => item.category === category)

  if (hasLineItems) return lineItems
  return getAggregateForCategory(property, category)
}

function getEffectiveTotalCosts(property: OwnedPropertyWithCosts, upToDate?: Date): number {
  return COST_CATEGORIES.reduce(
    (sum, category) => sum + getEffectiveCategoryTotal(property, category, upToDate),
    0
  )
}

function getSaleOrCurrentValue(property: OwnedPropertyWithCosts): number {
  if (property.status === 'sold' && property.sale_price !== null) {
    return toSafeNumber(property.sale_price)
  }
  return toSafeNumber(property.current_value)
}

function getSoldDateOrNull(property: OwnedPropertyWithCosts): Date | null {
  return property.status === 'sold' ? parseDateOrNull(property.sold_at) : null
}

function getAcquiredDate(property: OwnedPropertyWithCosts): Date | null {
  return parseDateOrNull(property.acquired_at)
}

function getMonthlyRange(properties: OwnedPropertyWithCosts[]): Date[] {
  if (properties.length === 0) return []

  const acquiredDates = properties
    .map(getAcquiredDate)
    .filter((d): d is Date => Boolean(d))
    .sort((a, b) => a.getTime() - b.getTime())

  if (acquiredDates.length === 0) return []

  const start = startOfMonth(acquiredDates[0])
  const end = startOfMonth(new Date())
  const months: Date[] = []
  let cursor = start
  while (!isAfter(cursor, end)) {
    months.push(cursor)
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
  }
  return months
}

function buildTrend(properties: OwnedPropertyWithCosts[]): OwnedTrendPoint[] {
  const months = getMonthlyRange(properties)
  if (months.length === 0) return []

  return months.map((monthStart) => {
    const monthEnd = endOfMonth(monthStart)
    let cumulativeCost = 0
    let portfolioValue = 0

    for (const property of properties) {
      const acquired = getAcquiredDate(property)
      if (!acquired || isAfter(acquired, monthEnd)) continue

      const soldAt = getSoldDateOrNull(property)
      const purchasePrice = toSafeNumber(property.purchase_price)
      const costs = getEffectiveTotalCosts(property, monthEnd)

      cumulativeCost += purchasePrice + costs

      if (property.status === 'sold' && soldAt && !isAfter(soldAt, monthEnd)) {
        portfolioValue += toSafeNumber(property.sale_price)
      } else {
        portfolioValue += toSafeNumber(property.current_value)
      }
    }

    return {
      month: format(monthStart, 'yyyy-MM'),
      label: format(monthStart, 'MMM yyyy'),
      portfolioValue,
      cumulativeCost,
      totalProfitLoss: portfolioValue - cumulativeCost,
    }
  })
}

function buildCategoryBreakdown(properties: OwnedPropertyWithCosts[]): OwnedCategoryBreakdown[] {
  return COST_CATEGORIES.map((category) => {
    const amount = properties.reduce(
      (sum, property) => sum + getEffectiveCategoryTotal(property, category),
      0
    )
    return {
      category,
      amount,
    }
  }).filter((row) => row.amount > 0)
}

function isSameCalendarYear(date: Date | null, year: number): boolean {
  return Boolean(date && date.getFullYear() === year)
}

function getYtdProfitLoss(properties: OwnedPropertyWithCosts[]): number {
  const now = new Date()
  const currentYear = now.getFullYear()
  const startOfCurrentYear = new Date(currentYear, 0, 1)
  let ytd = 0

  for (const property of properties) {
    const acquired = getAcquiredDate(property)
    const soldAt = getSoldDateOrNull(property)
    const items = property.owned_property_cost_items ?? []

    if (isSameCalendarYear(acquired, currentYear)) {
      ytd -= toSafeNumber(property.purchase_price)
      if (property.status === 'active') {
        ytd += toSafeNumber(property.current_value)
      }
    }

    if (isSameCalendarYear(soldAt, currentYear)) {
      ytd += toSafeNumber(property.sale_price)
    }

    const datedItemTotal = items.reduce((sum, item) => {
      const incurred = parseDateOrNull(item.incurred_on)
      if (!incurred) return sum
      if (incurred >= startOfCurrentYear) {
        return sum + toSafeNumber(item.amount)
      }
      return sum
    }, 0)

    ytd -= datedItemTotal

    const hasConstructionItems = items.some((item) => item.category === 'construction')
    const hasLegalItems = items.some((item) => item.category === 'legal')
    const hasInterestItems = items.some((item) => item.category === 'interest')
    if (isSameCalendarYear(acquired, currentYear)) {
      if (!hasConstructionItems) ytd -= toSafeNumber(property.construction_cost_total)
      if (!hasLegalItems) ytd -= toSafeNumber(property.legal_fees_total)
      if (!hasInterestItems) ytd -= toSafeNumber(property.interest_paid_total)
    }
  }

  return ytd
}

export function calculateOwnedAnalytics(properties: OwnedPropertyWithCosts[]): OwnedAnalytics {
  let realizedProfitLoss = 0
  let unrealizedProfitLoss = 0
  let totalConstructionCost = 0
  let totalLegalFees = 0
  let totalInterestPaid = 0
  let totalPortfolioValue = 0
  let totalCostBasis = 0

  for (const property of properties) {
    const purchasePrice = toSafeNumber(property.purchase_price)
    const constructionCost = getEffectiveCategoryTotal(property, 'construction')
    const legalFees = getEffectiveCategoryTotal(property, 'legal')
    const interestPaid = getEffectiveCategoryTotal(property, 'interest')
    const otherCosts =
      getEffectiveCategoryTotal(property, 'taxes') +
      getEffectiveCategoryTotal(property, 'insurance') +
      getEffectiveCategoryTotal(property, 'hoa') +
      getEffectiveCategoryTotal(property, 'utilities') +
      getEffectiveCategoryTotal(property, 'other')
    const totalCosts = purchasePrice + constructionCost + legalFees + interestPaid + otherCosts

    totalConstructionCost += constructionCost
    totalLegalFees += legalFees
    totalInterestPaid += interestPaid
    totalCostBasis += totalCosts

    const value = getSaleOrCurrentValue(property)
    totalPortfolioValue += value

    if (property.status === 'sold') {
      realizedProfitLoss += value - totalCosts
    } else {
      unrealizedProfitLoss += value - totalCosts
    }
  }

  const totalProfitLoss = realizedProfitLoss + unrealizedProfitLoss
  const summary: OwnedKpiSummary = {
    totalProfitLoss,
    ytdProfitLoss: getYtdProfitLoss(properties),
    totalConstructionCost,
    totalLegalFees,
    totalInterestPaid,
    totalPortfolioValue,
    totalCostBasis,
    realizedProfitLoss,
    unrealizedProfitLoss,
    propertyCount: properties.length,
  }

  const categoryBreakdown = buildCategoryBreakdown(properties)
  const trend = buildTrend(properties)

  return {
    summary,
    trend,
    categoryBreakdown,
    plBreakdown: [
      { label: 'Realized P/L', value: summary.realizedProfitLoss },
      { label: 'Unrealized P/L', value: summary.unrealizedProfitLoss },
      { label: 'Total P/L', value: summary.totalProfitLoss },
    ],
  }
}

export function getCostItemsInDateRange(
  items: OwnedPropertyCostItemRow[],
  start: Date,
  end: Date
): OwnedPropertyCostItemRow[] {
  return items.filter((item) => {
    const date = parseDateOrNull(item.incurred_on)
    if (!date) return false
    return !isBefore(date, start) && !isAfter(date, end)
  })
}
