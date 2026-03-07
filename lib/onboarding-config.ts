import type { Database } from '@/lib/types'

type FinancingMethod = Database['public']['Enums']['financing_method']
type ConditionPreference = Database['public']['Enums']['condition_preference']

export interface Option<T extends string = string> {
  label: string
  value: T
}

export const FINANCING_METHOD_OPTIONS: Option<FinancingMethod>[] = [
  { label: 'Cash', value: 'cash' },
  { label: 'Line of Credit', value: 'loc' },
  { label: 'Mortgage', value: 'mortgage' },
  { label: 'Mixed', value: 'mixed' },
]

export const CONDITION_PREFERENCE_OPTIONS: Option<ConditionPreference>[] = [
  { label: 'Teardown OK', value: 'teardown_ok' },
  { label: 'Needs Work', value: 'needs_work' },
  { label: 'Cosmetic Only', value: 'cosmetic_only' },
  { label: 'Structurally Sound', value: 'structurally_sound' },
]

export const EXPERIENCE_LEVEL_OPTIONS: Option[] = [
  { label: 'First Deal', value: 'first_deal' },
  { label: '1-5 Deals', value: '1_5_deals' },
  { label: '6-20 Deals', value: '6_20_deals' },
  { label: '20+ Deals', value: '20_plus_deals' },
]

export const PROPERTY_TYPE_OPTIONS: Option[] = [
  { label: 'Single Family', value: 'single_family' },
  { label: 'Multi Family', value: 'multi_family' },
  { label: 'Commercial', value: 'commercial' },
  { label: 'Land', value: 'land' },
]

export const COUNTY_OPTIONS: Option[] = [
  { label: 'Sedgwick', value: 'sedgwick' },
  { label: 'Butler', value: 'butler' },
  { label: 'Harvey', value: 'harvey' },
  { label: 'Cowley', value: 'cowley' },
]

export const INTENDED_USE_OPTIONS: Option[] = [
  { label: 'Flip', value: 'flip' },
  { label: 'Long-Term Rental', value: 'long_term_rental' },
  { label: 'Short-Term Rental', value: 'short_term_rental' },
  { label: 'Wholesale', value: 'wholesale' },
]

export const DESIRED_FEATURE_OPTIONS: Option[] = [
  { label: 'Pool', value: 'pool' },
  { label: 'Basement', value: 'basement' },
  { label: 'Garage', value: 'garage' },
  { label: 'Large Lot', value: 'large_lot' },
]

export const TIMELINE_OPTIONS: Option[] = [
  { label: 'Close in under 30 days', value: 'under_30_days' },
  { label: 'Close in 30-60 days', value: '30_60_days' },
  { label: 'Close in 60-90 days', value: '60_90_days' },
  { label: 'Flexible', value: 'flexible' },
]

export const YES_NO_OPTIONS: Option[] = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
]

export const DREAM_PROPERTY_PLACEHOLDERS = [
  'Example: 3 bed / 2 bath single-family in Wichita under $180k with strong rent potential',
  'Example: Value-add duplex in Sedgwick County with cosmetic rehab only',
  'Example: Distressed commercial mixed-use building near a growth corridor',
]
