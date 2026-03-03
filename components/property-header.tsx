import { Property } from "@/lib/types"
import { Badge } from "./ui/badge"

export function PropertyHeader({ property }: { property: Property }) {
  const getStageBadge = (stage: string | null) => {
    switch(stage) {
      case 'new_filing': return <Badge variant="info">NEW FILING</Badge>
      case 'sale_date_assigned': return <Badge variant="warning">SALE DATE SET</Badge>
      case 'upcoming': return <Badge variant="danger">AUCTION SCHEDULED</Badge>
      default: return <Badge>{stage?.toUpperCase() || 'UNKNOWN'}</Badge>
    }
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        {getStageBadge(property.stage)}
        <span className="font-mono text-sm text-muted">Case {property.case_number}</span>
      </div>
      <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
        {property.address}
      </h1>
      <p className="text-lg text-muted">
        {property.city}, {property.state} {property.zip_code}
      </p>
    </div>
  )
}
