import { OnboardingForm } from '@/components/onboarding/onboarding-form'
import {
  getCurrentUser,
  getDealRoomInvestors,
  getInvestorPreferences,
} from '@/lib/queries'
import type { Json, UserRole } from '@/lib/types'

const ADMIN_ROLES: UserRole[] = ['admin', 'super_admin']

const asRecord = (
  value: Json | null | undefined
): Record<string, Json | undefined> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, Json | undefined>
}

const asStringArray = (value: Json | undefined): string[] => {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

const asString = (value: Json | undefined): string | null =>
  typeof value === 'string' ? value : null

const pickFirstNonEmpty = (primary: string[], fallback: string[]): string[] =>
  primary.length > 0 ? primary : fallback

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{
    investor_id?: string
    saved?: string
  }>
}) {
  const params = await searchParams
  const user = await getCurrentUser()
  const canSubmit = !!user
  const userRole: UserRole = user?.role ?? 'investor'

  const canSwitchInvestor =
    !!user &&
    ADMIN_ROLES.includes(userRole) &&
    !!user.deal_room_id

  const investors =
    canSwitchInvestor && user.deal_room_id
      ? await getDealRoomInvestors(user.deal_room_id)
      : []

  const availableInvestorIds = new Set(investors.map((investor) => investor.id))
  let selectedInvestorId: string | null = null

  if (user) {
    if (canSwitchInvestor) {
      if (params.investor_id && availableInvestorIds.has(params.investor_id)) {
        selectedInvestorId = params.investor_id
      } else if (investors.length > 0) {
        selectedInvestorId = investors[0].id
      } else {
        selectedInvestorId = user.id
      }
    } else {
      selectedInvestorId = user.id
    }
  }

  const existingPreferences = selectedInvestorId
    ? await getInvestorPreferences(selectedInvestorId).catch(() => null)
    : null

  const locationPreferences = asRecord(existingPreferences?.location_preferences)
  const rawPreferences = asRecord(existingPreferences?.raw_preferences_json)

  const initialValues = {
    budgetMin: existingPreferences?.budget_min ?? null,
    budgetMax: existingPreferences?.budget_max ?? null,
    financingMethod: existingPreferences?.financing_method ?? null,
    targetCounties: pickFirstNonEmpty(
      asStringArray(rawPreferences?.target_counties),
      asStringArray(locationPreferences?.counties)
    ),
    targetZips: pickFirstNonEmpty(
      asStringArray(rawPreferences?.target_zips),
      asStringArray(locationPreferences?.zips)
    ),
    propertyTypes: existingPreferences?.property_types ?? [],
    intendedUse: existingPreferences?.intended_use ?? [],
    conditionPreference: existingPreferences?.condition_preference ?? null,
    contractorRelationship: asString(rawPreferences?.contractor_relationship),
    lenderLargeTransactions: asString(rawPreferences?.lender_large_transactions),
    dreamPropertyDescription: existingPreferences?.dream_property_description ?? null,
    painPoints: asStringArray(rawPreferences?.pain_points),
    riskTolerance: existingPreferences?.risk_tolerance ?? null,
    experienceLevel: asString(rawPreferences?.experience_level),
    dealBreakers: existingPreferences?.deal_breakers ?? [],
    desiredFeatures: existingPreferences?.desired_features ?? [],
    timelinePreference: existingPreferences?.timeline_preference ?? null,
  }

  const savedMode =
    params.saved === 'submitted'
      ? 'submitted'
      : params.saved === 'draft'
        ? 'draft'
        : null

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div>
        <h1 className="font-display font-bold text-[28px] text-text-primary">
          Onboarding Profile
        </h1>
        <p className="text-text-secondary mt-2 max-w-3xl">
          Capture investor preferences for budget, risk, deal criteria, and
          property strategy. Save drafts during calls and submit when complete.
        </p>
      </div>

      <OnboardingForm
        canSubmit={canSubmit}
        viewerRole={user ? userRole : null}
        investors={investors.map((investor) => ({
          id: investor.id,
          fullName: investor.full_name,
          email: investor.email,
        }))}
        selectedInvestorId={selectedInvestorId}
        initialValues={initialValues}
        savedMode={savedMode}
      />
    </div>
  )
}
