'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { Database, Json, UserRole } from '@/lib/types'

type FinancingMethod = Database['public']['Enums']['financing_method']
type ConditionPreference = Database['public']['Enums']['condition_preference']

const FINANCING_METHOD_VALUES: FinancingMethod[] = [
  'cash',
  'loc',
  'mortgage',
  'mixed',
]

const CONDITION_PREFERENCE_VALUES: ConditionPreference[] = [
  'teardown_ok',
  'needs_work',
  'cosmetic_only',
  'structurally_sound',
]

const ADMIN_ROLES: UserRole[] = ['admin', 'super_admin']

const isNonEmptyString = (value: FormDataEntryValue | null): value is string =>
  typeof value === 'string' && value.trim().length > 0

const parseNumber = (value: FormDataEntryValue | null): number | null => {
  if (!isNonEmptyString(value)) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const parseStringList = (value: FormDataEntryValue | null): string[] => {
  if (!isNonEmptyString(value)) return []
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

const parseMultiValue = (values: FormDataEntryValue[]): string[] =>
  values
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .filter(Boolean)

export async function saveOnboardingPreferences(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/onboarding')
  }

  const { data: viewer, error: viewerError } = await supabase
    .from('profiles')
    .select('id, role, deal_room_id')
    .eq('id', user.id)
    .single()

  if (viewerError || !viewer) {
    throw new Error('Unable to load authenticated user profile')
  }

  const viewerRole: UserRole = viewer.role ?? 'investor'
  const investorIdField = formData.get('investor_id')

  const requestedInvestorId =
    isNonEmptyString(investorIdField) &&
    ADMIN_ROLES.includes(viewerRole)
      ? investorIdField.trim()
      : viewer.id

  if (viewerRole === 'admin' && requestedInvestorId !== viewer.id) {
    if (!viewer.deal_room_id) {
      throw new Error('Admin profile is missing a deal room assignment')
    }

    const { data: target } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', requestedInvestorId)
      .eq('role', 'investor')
      .eq('deal_room_id', viewer.deal_room_id)
      .maybeSingle()

    if (!target) {
      throw new Error('You are not authorized to edit onboarding for this investor')
    }
  }

  if (viewerRole === 'investor' && requestedInvestorId !== viewer.id) {
    throw new Error('Investors can only edit their own onboarding profile')
  }

  const financingMethodRaw = formData.get('financing_method')
  const financingMethod =
    isNonEmptyString(financingMethodRaw) &&
    FINANCING_METHOD_VALUES.includes(financingMethodRaw as FinancingMethod)
      ? (financingMethodRaw as FinancingMethod)
      : null

  const conditionPreferenceRaw = formData.get('condition_preference')
  const conditionPreference =
    isNonEmptyString(conditionPreferenceRaw) &&
    CONDITION_PREFERENCE_VALUES.includes(
      conditionPreferenceRaw as ConditionPreference
    )
      ? (conditionPreferenceRaw as ConditionPreference)
      : null

  const riskToleranceParsed = parseNumber(formData.get('risk_tolerance'))
  const riskTolerance =
    riskToleranceParsed === null
      ? null
      : Math.max(1, Math.min(10, Math.round(riskToleranceParsed)))

  const saveMode =
    formData.get('save_mode') === 'submitted' ? 'submitted' : 'draft'

  const targetCounties = parseMultiValue(formData.getAll('target_counties'))
  const targetZips = parseStringList(formData.get('target_zips'))
  const contractorRelationship =
    (formData.get('contractor_relationship') as string | null) ?? null
  const lenderLargeTransactions = (formData.get('lender_large_transactions') as string | null) ?? null
  const painPoints = parseStringList(formData.get('pain_points'))
  const experienceLevel = (formData.get('experience_level') as string | null) ?? null

  const rawPreferencesJson: Json = {
    status: saveMode,
    target_counties: targetCounties,
    target_zips: targetZips,
    contractor_relationship: contractorRelationship,
    lender_large_transactions: lenderLargeTransactions,
    pain_points: painPoints,
    experience_level: experienceLevel,
  }

  const serviceClient = await createServiceClient()
  const { error } = await serviceClient.from('investor_preferences').upsert(
    {
      investor_id: requestedInvestorId,
      budget_min: parseNumber(formData.get('budget_min')),
      budget_max: parseNumber(formData.get('budget_max')),
      financing_method: financingMethod,
      risk_tolerance: riskTolerance,
      property_types: parseMultiValue(formData.getAll('property_types')),
      intended_use: parseMultiValue(formData.getAll('intended_use')),
      location_preferences: {
        counties: targetCounties,
        zips: targetZips,
      },
      condition_preference: conditionPreference,
      timeline_preference: (formData.get('timeline_preference') as string | null) ?? null,
      deal_breakers: parseStringList(formData.get('deal_breakers')),
      desired_features: parseMultiValue(formData.getAll('desired_features')),
      dream_property_description:
        (formData.get('dream_property_description') as string | null) ?? null,
      raw_preferences_json: rawPreferencesJson,
    },
    {
      onConflict: 'investor_id',
    }
  )

  if (error) {
    throw error
  }

  revalidatePath('/onboarding')
  redirect(`/onboarding?investor_id=${requestedInvestorId}&saved=${saveMode}`)
}
