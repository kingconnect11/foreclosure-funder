"use client"

import { Profile } from "@/lib/types"
import React, { useState } from "react"
import { ChevronDown, ChevronRight, User } from "lucide-react"

export function InvestorTable({ 
  investors, 
  summaries 
}: { 
  investors: Profile[]
  summaries: Record<string, Record<string, number>>
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (investors.length === 0) {
    return (
      <div className="rounded-sharp border border-dashed border-border bg-surface-1/50 p-12 text-center flex flex-col items-center">
        <div className="h-12 w-12 rounded-full bg-surface-2 flex items-center justify-center mb-4">
          <User className="h-6 w-6 text-muted" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">No investors found</h3>
        <p className="text-sm text-muted max-w-sm">
          No investors have joined this deal room yet.
        </p>
      </div>
    )
  }

  const getActiveDealsCount = (summary: Record<string, number>) => {
    const activeStages = ['preparing_offer', 'offer_submitted', 'counter_offered', 'offer_accepted', 'in_closing']
    return activeStages.reduce((sum, stage) => sum + (summary[stage] || 0), 0)
  }

  const getTotalSavedCount = (summary: Record<string, number>) => {
    return Object.values(summary).reduce((sum, count) => sum + count, 0)
  }

  return (
    <div className="rounded-sharp border border-border bg-surface-1 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface-2 text-muted border-b border-border">
            <tr>
              <th className="w-10 px-4 py-3"></th>
              <th className="px-4 py-3 font-medium uppercase tracking-wider text-[10px]">Name</th>
              <th className="px-4 py-3 font-medium uppercase tracking-wider text-[10px]">Email</th>
              <th className="px-4 py-3 font-medium uppercase tracking-wider text-[10px]">Tier</th>
              <th className="px-4 py-3 font-medium uppercase tracking-wider text-[10px] text-center">Properties Saved</th>
              <th className="px-4 py-3 font-medium uppercase tracking-wider text-[10px] text-center">Active Deals</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {investors.map((investor) => {
              const summary = summaries[investor.id] || {}
              const isExpanded = expandedId === investor.id
              const savedCount = getTotalSavedCount(summary)
              const activeCount = getActiveDealsCount(summary)

              return (
                <React.Fragment key={investor.id}>
                  <tr 
                    className="hover:bg-surface-2/50 cursor-pointer transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : investor.id)}
                  >
                    <td className="px-4 py-4 text-muted">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </td>
                    <td className="px-4 py-4 font-medium text-foreground">{investor.full_name || '—'}</td>
                    <td className="px-4 py-4 text-muted">{investor.email}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center rounded-full bg-surface-2 px-2 py-1 text-xs font-medium text-muted capitalize">
                        {investor.subscription_tier || 'free'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center font-mono">{savedCount}</td>
                    <td className="px-4 py-4 text-center font-mono text-accent-pine">{activeCount}</td>
                  </tr>
                  
                  {isExpanded && (
                    <tr className="bg-surface-2/30">
                      <td colSpan={6} className="px-14 py-6 border-t border-border/50">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">Pipeline Summary</h4>
                        {Object.keys(summary).length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                            {Object.entries(summary).map(([stage, count]) => (
                              <div key={stage} className="bg-surface-1 rounded-sharp border border-border p-3 text-center">
                                <p className="font-mono text-xl font-semibold text-foreground mb-1">{count}</p>
                                <p className="text-[10px] uppercase tracking-wider text-muted truncate" title={stage.replace('_', ' ')}>
                                  {stage.replace('_', ' ')}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted">No properties in pipeline.</p>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
