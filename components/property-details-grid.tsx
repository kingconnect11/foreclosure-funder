import { Property } from "@/lib/types"
import { formatCurrency, formatDate, saleDateUrgency } from "@/lib/utils"

export function PropertyDetailsGrid({ property }: { property: Property }) {
  const urgency = saleDateUrgency(property.sale_date)
  
  return (
    <div className="rounded-sharp border border-border bg-surface-1 p-6 mb-8">
      <h2 className="font-serif text-xl font-semibold mb-6 border-b border-border pb-4">Property Details</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
        <div>
          <p className="text-sm text-muted mb-1">Bedrooms</p>
          <p className="font-medium">{property.bedrooms ?? "—"}</p>
        </div>
        <div>
          <p className="text-sm text-muted mb-1">Bathrooms</p>
          <p className="font-medium">{property.bathrooms ?? "—"}</p>
        </div>
        <div>
          <p className="text-sm text-muted mb-1">Square Feet</p>
          <p className="font-medium">{property.sqft?.toLocaleString() ?? "—"}</p>
        </div>
        <div>
          <p className="text-sm text-muted mb-1">Property Type</p>
          <p className="font-medium">{property.property_type ?? "—"}</p>
        </div>
        
        <div className="col-span-2 md:col-span-1"></div>

        <div>
          <p className="text-sm text-muted mb-1">County Appraisal</p>
          <p className="font-mono font-semibold">{formatCurrency(property.county_appraisal)}</p>
        </div>
        <div>
          <p className="text-sm text-muted mb-1">Foreclosure Amount</p>
          <p className="font-mono font-semibold text-danger">{formatCurrency(property.foreclosure_amount)}</p>
        </div>
        <div>
          <p className="text-sm text-muted mb-1">Sale Date</p>
          <p className={`font-mono font-medium ${urgency === 'danger' ? 'text-danger' : urgency === 'warning' ? 'text-warning' : ''}`}>
            {formatDate(property.sale_date)}
          </p>
        </div>

        <div className="col-span-2 md:col-span-3 mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted mb-1">Defendant</p>
            <p className="text-sm">{property.defendant_name ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted mb-1">Attorney</p>
            <p className="text-sm">{property.attorney_name ?? "—"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
