import { format, formatDistanceToNow, differenceInDays } from 'date-fns'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatMonths(months: number): string {
  if (months === 1) return '1 month'
  return `${months} months`
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  return format(new Date(date), 'EEE, MMM d, yyyy')
}

export function formatNumber(n: number | null | undefined): string {
  if (n == null) return '—'
  return new Intl.NumberFormat('en-US').format(n)
}

export function saleDateUrgency(
  saleDate: string | null | undefined
): 'danger' | 'warning' | 'normal' {
  if (!saleDate) return 'normal'
  const days = differenceInDays(new Date(saleDate), new Date())
  if (days <= 14) return 'danger'
  if (days <= 30) return 'warning'
  return 'normal'
}

export function timeInStage(stageChangedAt: string | null | undefined): string {
  if (!stageChangedAt) return '—'
  return formatDistanceToNow(new Date(stageChangedAt), { addSuffix: false })
}

export function formatPropertyDetails(
  beds: number | null,
  baths: number | null,
  sqft: number | null
): string {
  const parts: string[] = []
  if (beds != null) parts.push(`${beds} BD`)
  if (baths != null) parts.push(`${baths} BA`)
  if (sqft != null) parts.push(`${formatNumber(sqft)} sqft`)
  return parts.join(' · ')
}
