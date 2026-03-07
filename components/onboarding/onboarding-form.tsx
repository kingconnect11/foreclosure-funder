'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { UserRole } from '@/lib/types'
import { saveOnboardingPreferences } from '@/actions/onboarding'
import {
  CONDITION_PREFERENCE_OPTIONS,
  COUNTY_OPTIONS,
  DESIRED_FEATURE_OPTIONS,
  DREAM_PROPERTY_PLACEHOLDERS,
  EXPERIENCE_LEVEL_OPTIONS,
  FINANCING_METHOD_OPTIONS,
  INTENDED_USE_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  TIMELINE_OPTIONS,
  YES_NO_OPTIONS,
} from '@/lib/onboarding-config'

export interface OnboardingInitialValues {
  budgetMin: number | null
  budgetMax: number | null
  financingMethod: string | null
  targetCounties: string[]
  targetZips: string[]
  propertyTypes: string[]
  intendedUse: string[]
  conditionPreference: string | null
  contractorRelationship: string | null
  lenderLargeTransactions: string | null
  dreamPropertyDescription: string | null
  painPoints: string[]
  riskTolerance: number | null
  experienceLevel: string | null
  dealBreakers: string[]
  desiredFeatures: string[]
  timelinePreference: string | null
}

interface InvestorOption {
  id: string
  fullName: string | null
  email: string | null
}

interface OnboardingFormProps {
  canSubmit: boolean
  viewerRole: UserRole | null
  investors: InvestorOption[]
  selectedInvestorId: string | null
  initialValues: OnboardingInitialValues
  savedMode: 'draft' | 'submitted' | null
}

const ADMIN_ROLES: UserRole[] = ['admin', 'super_admin']

interface MultiSelectField {
  label: string
  name: string
  options: Array<{ label: string; value: string }>
}

const MULTI_SELECT_FIELDS: MultiSelectField[] = [
  { label: 'Property Types', name: 'property_types', options: PROPERTY_TYPE_OPTIONS },
  { label: 'Intended Use', name: 'intended_use', options: INTENDED_USE_OPTIONS },
  { label: 'Target Counties', name: 'target_counties', options: COUNTY_OPTIONS },
  { label: 'Desired Features', name: 'desired_features', options: DESIRED_FEATURE_OPTIONS },
]

export function OnboardingForm({
  canSubmit,
  viewerRole,
  investors,
  selectedInvestorId,
  initialValues,
  savedMode,
}: OnboardingFormProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [placeholderIndex, setPlaceholderIndex] = useState(0)

  const showInvestorSwitcher = !!viewerRole && ADMIN_ROLES.includes(viewerRole)

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((current) =>
        (current + 1) % DREAM_PROPERTY_PLACEHOLDERS.length
      )
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  const updateInvestor = (investorId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('investor_id', investorId)
    params.delete('saved')
    router.push(`${pathname}?${params.toString()}`)
  }

  const selectedValues = {
    property_types: new Set(initialValues.propertyTypes),
    intended_use: new Set(initialValues.intendedUse),
    target_counties: new Set(initialValues.targetCounties),
    desired_features: new Set(initialValues.desiredFeatures),
  }

  return (
    <div className="flex flex-col gap-6">
      {savedMode && (
        <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {savedMode === 'submitted'
            ? 'Onboarding was submitted successfully.'
            : 'Onboarding draft was saved.'}
        </div>
      )}

      {showInvestorSwitcher && investors.length > 0 && (
        <div className="zen-card p-4">
          <label className="block text-[12px] font-medium uppercase tracking-[0.05em] text-text-secondary mb-2">
            Investor Profile
          </label>
          <select
            value={selectedInvestorId ?? ''}
            onChange={(event) => updateInvestor(event.target.value)}
            className="input-zen"
          >
            {investors.map((investor) => (
              <option key={investor.id} value={investor.id}>
                {investor.fullName || investor.email || investor.id}
              </option>
            ))}
          </select>
        </div>
      )}

      <form action={saveOnboardingPreferences} className="zen-card p-6 lg:p-8 space-y-8">
        {selectedInvestorId && (
          <input type="hidden" name="investor_id" value={selectedInvestorId} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-medium uppercase tracking-[0.05em] text-text-secondary mb-2">
              Budget Minimum
            </label>
            <input
              type="number"
              name="budget_min"
              defaultValue={initialValues.budgetMin ?? ''}
              className="input-zen"
              placeholder="50000"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium uppercase tracking-[0.05em] text-text-secondary mb-2">
              Budget Maximum
            </label>
            <input
              type="number"
              name="budget_max"
              defaultValue={initialValues.budgetMax ?? ''}
              className="input-zen"
              placeholder="250000"
            />
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-medium uppercase tracking-[0.05em] text-text-secondary mb-2">
            Financing Method
          </label>
          <select
            name="financing_method"
            defaultValue={initialValues.financingMethod ?? ''}
            className="input-zen"
          >
            <option value="">Select financing strategy</option>
            {FINANCING_METHOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {MULTI_SELECT_FIELDS.map((field) => (
          <fieldset key={field.name}>
            <legend className="block text-[12px] font-medium uppercase tracking-[0.05em] text-text-secondary mb-3">
              {field.label}
            </legend>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {field.options.map((option) => (
                <label
                  key={option.value}
                  className="flex min-h-[44px] items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-primary"
                >
                  <input
                    type="checkbox"
                    name={field.name}
                    value={option.value}
                    defaultChecked={selectedValues[
                      field.name as keyof typeof selectedValues
                    ].has(option.value)}
                    className="h-5 w-5 shrink-0 accent-accent"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        <div>
          <label className="block text-[12px] font-medium uppercase tracking-[0.05em] text-text-secondary mb-2">
            Target ZIP Codes (comma separated)
          </label>
          <input
            type="text"
            name="target_zips"
            defaultValue={initialValues.targetZips.join(', ')}
            className="input-zen"
            placeholder="67202, 67206, 67037"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-medium uppercase tracking-[0.05em] text-text-secondary mb-2">
              Contractor Relationships
            </label>
            <select
              name="contractor_relationship"
              defaultValue={initialValues.contractorRelationship ?? ''}
              className="input-zen"
            >
              <option value="">Select</option>
              {YES_NO_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium uppercase tracking-[0.05em] text-text-secondary mb-2">
              Lender For Large Transactions
            </label>
            <input
              type="text"
              name="lender_large_transactions"
              defaultValue={initialValues.lenderLargeTransactions ?? ''}
              className="input-zen"
              placeholder="Optional lender contact"
            />
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-medium uppercase tracking-[0.05em] text-text-secondary mb-2">
            Condition Preference
          </label>
          <select
            name="condition_preference"
            defaultValue={initialValues.conditionPreference ?? ''}
            className="input-zen"
          >
            <option value="">Select condition preference</option>
            {CONDITION_PREFERENCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[12px] font-medium uppercase tracking-[0.05em] text-text-secondary mb-2">
            Dream Property Description
          </label>
          <textarea
            name="dream_property_description"
            defaultValue={initialValues.dreamPropertyDescription ?? ''}
            className="input-zen min-h-[130px]"
            placeholder={DREAM_PROPERTY_PLACEHOLDERS[placeholderIndex]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-medium uppercase tracking-[0.05em] text-text-secondary mb-2">
              Risk Tolerance (1-10)
            </label>
            <input
              type="number"
              min={1}
              max={10}
              name="risk_tolerance"
              defaultValue={initialValues.riskTolerance ?? ''}
              className="input-zen"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium uppercase tracking-[0.05em] text-text-secondary mb-2">
              Experience Level
            </label>
            <select
              name="experience_level"
              defaultValue={initialValues.experienceLevel ?? ''}
              className="input-zen"
            >
              <option value="">Select experience level</option>
              {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-medium uppercase tracking-[0.05em] text-text-secondary mb-2">
            Pain Points (comma separated)
          </label>
          <input
            type="text"
            name="pain_points"
            defaultValue={initialValues.painPoints.join(', ')}
            className="input-zen"
            placeholder="Unexpected rehab costs, title complexity"
          />
        </div>

        <div>
          <label className="block text-[12px] font-medium uppercase tracking-[0.05em] text-text-secondary mb-2">
            Deal Breakers (comma separated)
          </label>
          <input
            type="text"
            name="deal_breakers"
            defaultValue={initialValues.dealBreakers.join(', ')}
            className="input-zen"
            placeholder="Foundation issues, no clear title"
          />
        </div>

        <div>
          <label className="block text-[12px] font-medium uppercase tracking-[0.05em] text-text-secondary mb-2">
            Timeline To Close
          </label>
          <select
            name="timeline_preference"
            defaultValue={initialValues.timelinePreference ?? ''}
            className="input-zen"
          >
            <option value="">Select timeline</option>
            {TIMELINE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {!canSubmit && (
          <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning-dark">
            Sign in to save onboarding preferences to investor profiles.
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {canSubmit ? (
            <>
              <button type="submit" name="save_mode" value="draft" className="btn-secondary">
                Save Draft
              </button>
              <button type="submit" name="save_mode" value="submitted" className="btn-primary">
                Submit Onboarding
              </button>
            </>
          ) : (
            <Link href="/login?next=/onboarding" className="btn-primary">
              Sign In To Save
            </Link>
          )}
        </div>
      </form>
    </div>
  )
}
