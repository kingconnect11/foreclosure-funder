"use client"

import { Property } from "@/lib/types"
import { formatCurrency, formatDate, formatPropertyDetails, saleDateUrgency } from "@/lib/utils"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import Link from "next/link"
import { saveToPipeline } from "@/actions/pipeline"
import { useState, useTransition } from "react"
import { Bookmark, Check } from "lucide-react"

export function PropertyCard({ property, isSaved = false }: { property: Property; isSaved?: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(isSaved)

  const getStageBadge = (stage: string | null) => {
    switch(stage) {
      case 'new_filing': return <Badge variant="info">NEW FILING</Badge>
      case 'sale_date_assigned': return <Badge variant="warning">SALE DATE SET</Badge>
      case 'upcoming': return <Badge variant="danger">AUCTION SCHEDULED</Badge>
      default: return <Badge>{stage?.toUpperCase() || 'UNKNOWN'}</Badge>
    }
  }

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    startTransition(async () => {
      setSaved(true)
      await saveToPipeline(property.id)
    })
  }

  const urgency = saleDateUrgency(property.sale_date)
  const urgencyColor = urgency === 'danger' ? 'bg-danger' : urgency === 'warning' ? 'bg-warning' : 'bg-transparent'

  return (
    <Link href={`/property/${property.id}`} className="group block relative rounded-sharp border border-border bg-surface-1 hover:border-accent-pine/50 transition-colors overflow-hidden flex flex-col h-full">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${urgencyColor}`}></div>
      
      <div className="p-5 pl-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4">
          {getStageBadge(property.stage)}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 -mt-2 -mr-2 text-muted hover:text-foreground"
            onClick={handleSave}
            disabled={saved || isPending}
          >
            {saved ? <Check className="h-4 w-4 text-accent-pine" /> : <Bookmark className="h-4 w-4" />}
          </Button>
        </div>

        <h3 className="font-serif text-xl font-semibold text-foreground mb-1 group-hover:text-accent-pine transition-colors">
          {property.address}
        </h3>
        <p className="text-sm text-muted mb-4">
          {property.city}, {property.state} {property.zip_code}
        </p>

        <div className="text-sm font-medium text-foreground mb-6">
          {formatPropertyDetails(property.bedrooms, property.bathrooms, property.sqft) || "Details unavailable"}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-4 border-t border-border pt-4">
          <div>
            <p className="text-xs text-muted mb-1">Appraisal</p>
            <p className="font-mono text-sm font-semibold">{formatCurrency(property.county_appraisal)}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Foreclosure</p>
            <p className="font-mono text-sm font-semibold text-danger">{formatCurrency(property.foreclosure_amount)}</p>
          </div>
          <div className="col-span-2 flex justify-between items-end mt-2">
            <div>
              <p className="text-xs text-muted mb-1">Sale Date</p>
              <p className={`font-mono text-sm ${urgency === 'danger' ? 'text-danger' : urgency === 'warning' ? 'text-warning' : 'text-foreground'}`}>
                {formatDate(property.sale_date)}
              </p>
            </div>
            <p className="text-xs text-muted font-mono">{property.case_number}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
