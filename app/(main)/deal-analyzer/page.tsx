import { getProperty, getCurrentUser } from '@/lib/queries'
import { DealAnalyzerClient } from '@/components/deal-analyzer/DealAnalyzerClient'
import type { DealInputs } from '@/lib/deal-analyzer/calculations'

export default async function DealAnalyzerPage({
  searchParams,
}: {
  searchParams: Promise<{ propertyId?: string }>
}) {
  const params = await searchParams
  const user = await getCurrentUser()
  if (!user) return null

  let initialInputs: Partial<DealInputs> | undefined
  let propertyLabel: string | undefined

  if (params.propertyId) {
    const property = await getProperty(params.propertyId).catch(() => null)
    if (property) {
      const addressParts = [property.address, property.city, property.state].filter(Boolean)
      propertyLabel = addressParts.join(', ')

      initialInputs = {}
      if (property.foreclosure_amount) {
        initialInputs.purchasePrice = property.foreclosure_amount
      }
      if (property.county_appraisal) {
        initialInputs.arv = property.county_appraisal
      }
    }
  }

  return (
    <DealAnalyzerClient
      initialInputs={initialInputs}
      propertyLabel={propertyLabel}
    />
  )
}
