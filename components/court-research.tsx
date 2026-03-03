import { CourtResearch } from "@/lib/types"
import { Badge } from "./ui/badge"
import { formatCurrency } from "@/lib/utils"

export function CourtResearchSection({ research }: { research: CourtResearch | null }) {
  if (!research) {
    return (
      <div className="rounded-sharp border border-border bg-surface-1 p-6 mb-8">
        <h2 className="font-serif text-xl font-semibold mb-4 border-b border-border pb-4">Title & Lien Research</h2>
        <p className="text-muted text-sm italic">Court research not yet available for this property.</p>
      </div>
    )
  }

  const getTitleStatusBadge = (status: string | null) => {
    switch(status) {
      case 'clean': return <Badge className="bg-accent-pine text-white">CLEAN</Badge>
      case 'clouded': return <Badge variant="warning">CLOUDED</Badge>
      case 'complex': return <Badge variant="danger">COMPLEX</Badge>
      default: return null
    }
  }

  const liens = (research.liens as any[]) || []
  const judgments = (research.judgments as any[]) || []

  return (
    <div className="rounded-sharp border border-border bg-surface-1 p-6 mb-8">
      <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
        <h2 className="font-serif text-xl font-semibold">Title & Lien Research</h2>
        {getTitleStatusBadge(research.title_status)}
      </div>

      <div className="space-y-6">
        {research.research_summary && (
          <div className="bg-surface-2 p-4 rounded-sharp border border-border">
            <h3 className="text-sm font-semibold mb-2">Research Summary</h3>
            <p className="text-sm text-muted leading-relaxed">{research.research_summary}</p>
          </div>
        )}

        {(research.estimated_offer_min || research.estimated_offer_max) && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Estimated Offer Range</h3>
            <p className="font-mono text-lg">
              {formatCurrency(research.estimated_offer_min)} - {formatCurrency(research.estimated_offer_max)}
            </p>
          </div>
        )}

        {liens.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Identified Liens</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-surface-2 text-muted border-b border-border">
                  <tr>
                    <th className="px-4 py-2 font-medium">Type</th>
                    <th className="px-4 py-2 font-medium">Creditor</th>
                    <th className="px-4 py-2 font-medium">Amount</th>
                    <th className="px-4 py-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {liens.map((lien, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="px-4 py-2">{lien.type || '—'}</td>
                      <td className="px-4 py-2">{lien.creditor || '—'}</td>
                      <td className="px-4 py-2 font-mono">{formatCurrency(lien.amount)}</td>
                      <td className="px-4 py-2">{lien.date || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {judgments.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Judgments</h3>
            <ul className="list-disc pl-5 text-sm text-muted space-y-1">
              {judgments.map((j, i) => (
                <li key={i}>{j.description || JSON.stringify(j)}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
