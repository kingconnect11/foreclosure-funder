import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
  formatMonths,
  formatPropertyDetails,
  saleDateUrgency,
  timeInStage,
  cn,
} from '@/lib/utils'

describe('formatCurrency', () => {
  it('formats positive numbers as USD with no decimals', () => {
    expect(formatCurrency(85000)).toBe('$85,000')
    expect(formatCurrency(1234567)).toBe('$1,234,567')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0')
  })

  it('formats negative numbers', () => {
    expect(formatCurrency(-5000)).toBe('-$5,000')
  })

  it('returns em dash for null and undefined', () => {
    expect(formatCurrency(null)).toBe('\u2014')
    expect(formatCurrency(undefined)).toBe('\u2014')
  })
})

describe('formatDate', () => {
  it('formats a valid ISO date string', () => {
    const result = formatDate('2026-03-15T12:00:00Z')
    expect(result).toMatch(/Mar 15, 2026/)
  })

  it('returns em dash for null and undefined', () => {
    expect(formatDate(null)).toBe('\u2014')
    expect(formatDate(undefined)).toBe('\u2014')
  })

  it('returns em dash for empty string', () => {
    expect(formatDate('')).toBe('\u2014')
  })
})

describe('formatNumber', () => {
  it('formats numbers with commas', () => {
    expect(formatNumber(1500)).toBe('1,500')
    expect(formatNumber(1000000)).toBe('1,000,000')
  })

  it('returns em dash for null and undefined', () => {
    expect(formatNumber(null)).toBe('\u2014')
    expect(formatNumber(undefined)).toBe('\u2014')
  })
})

describe('formatPercent', () => {
  it('formats with one decimal place and % sign', () => {
    expect(formatPercent(8)).toBe('8.0%')
    expect(formatPercent(12.5)).toBe('12.5%')
    expect(formatPercent(0)).toBe('0.0%')
  })
})

describe('formatMonths', () => {
  it('returns singular for 1 month', () => {
    expect(formatMonths(1)).toBe('1 month')
  })

  it('returns plural for other values', () => {
    expect(formatMonths(4)).toBe('4 months')
    expect(formatMonths(12)).toBe('12 months')
  })
})

describe('formatPropertyDetails', () => {
  it('formats all three fields', () => {
    expect(formatPropertyDetails(3, 2, 1500)).toBe('3 BD \u00B7 2 BA \u00B7 1,500 sqft')
  })

  it('handles null fields gracefully', () => {
    expect(formatPropertyDetails(3, null, null)).toBe('3 BD')
    expect(formatPropertyDetails(null, 2, null)).toBe('2 BA')
    expect(formatPropertyDetails(null, null, 1200)).toBe('1,200 sqft')
  })

  it('returns empty string when all null', () => {
    expect(formatPropertyDetails(null, null, null)).toBe('')
  })
})

describe('saleDateUrgency', () => {
  let realDate: typeof Date

  beforeEach(() => {
    realDate = globalThis.Date
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns normal for null/undefined', () => {
    expect(saleDateUrgency(null)).toBe('normal')
    expect(saleDateUrgency(undefined)).toBe('normal')
  })

  it('returns danger when sale date is within 14 days', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-01'))
    expect(saleDateUrgency('2026-03-10')).toBe('danger')
  })

  it('returns warning when sale date is 15-30 days away', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-01'))
    expect(saleDateUrgency('2026-03-20')).toBe('warning')
  })

  it('returns normal when sale date is more than 30 days away', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-01'))
    expect(saleDateUrgency('2026-05-01')).toBe('normal')
  })
})

describe('timeInStage', () => {
  it('returns em dash for null/undefined', () => {
    expect(timeInStage(null)).toBe('\u2014')
    expect(timeInStage(undefined)).toBe('\u2014')
  })

  it('returns a human-readable duration for a past date', () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const result = timeInStage(thirtyDaysAgo)
    expect(result).toMatch(/month|days|about/)
  })
})

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })

  it('resolves tailwind conflicts (last wins)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})
