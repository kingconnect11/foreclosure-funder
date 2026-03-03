'use client'

import React, { useState } from 'react'
import { Profile } from '@/lib/types'
import { Users } from 'lucide-react'

type InvestorWithSummary = Profile & {
  summary: Record<string, number>
}

const ACTIVE_STAGES = ['researching', 'site_visit', 'preparing_offer', 'offer_submitted', 'counter_offered', 'offer_accepted', 'in_closing']

export function AdminInvestorTable({ investors }: { investors: InvestorWithSummary[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (investors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 bg-surface border border-border rounded p-6">
        <Users className="w-8 h-8 text-text-muted" />
        <p className="text-text-muted text-sm text-center">
          No investors have joined this deal room yet.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded overflow-x-auto">
      <table className="w-full text-left border-collapse whitespace-nowrap min-w-[600px]">
        <thead>
          <tr className="border-b border-border">
            <th className="px-5 py-4 text-[12px] font-medium uppercase tracking-[0.05em] text-text-muted">Name</th>
            <th className="px-5 py-4 text-[12px] font-medium uppercase tracking-[0.05em] text-text-muted">Email</th>
            <th className="px-5 py-4 text-[12px] font-medium uppercase tracking-[0.05em] text-text-muted">Tier</th>
            <th className="px-5 py-4 text-[12px] font-medium uppercase tracking-[0.05em] text-text-muted">Saved</th>
            <th className="px-5 py-4 text-[12px] font-medium uppercase tracking-[0.05em] text-text-muted">Active Deals</th>
            <th className="px-5 py-4 text-[12px] font-medium uppercase tracking-[0.05em] text-text-muted">Last Active</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {investors.map((investor) => {
            const totalSaved = Object.values(investor.summary).reduce((a, b) => a + b, 0)
            const activeDeals = Object.entries(investor.summary)
              .filter(([stage]) => ACTIVE_STAGES.includes(stage))
              .reduce((a, [, count]) => a + count, 0)
              
            const isExpanded = expandedId === investor.id

            return (
              <React.Fragment key={investor.id}>
                <tr 
                  onClick={() => setExpandedId(isExpanded ? null : investor.id)}
                  className="border-b border-border hover:bg-surface-elevated transition-colors cursor-pointer"
                >
                  <td className="px-5 py-4 font-medium text-text-primary">{investor.full_name || 'Unnamed'}</td>
                  <td className="px-5 py-4 text-text-secondary">{investor.email}</td>
                  <td className="px-5 py-4">
                    <span className="inline-block px-2 py-[2px] rounded-[2px] text-[10px] tracking-[0.08em] font-medium uppercase border bg-surface-elevated text-text-primary border-border">
                      {investor.subscription_tier}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-data text-text-primary">{totalSaved}</td>
                  <td className="px-5 py-4 font-data text-text-primary">{activeDeals}</td>
                  <td className="px-5 py-4 text-text-muted font-data">
                    {investor.updated_at ? new Date(investor.updated_at).toLocaleDateString() : '--'}
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="bg-[#0f1d30] border-b border-border">
                    <td colSpan={6} className="px-5 py-6">
                      <div className="flex flex-col gap-3">
                        <span className="text-[12px] font-medium uppercase tracking-[0.05em] text-text-muted">Pipeline Summary</span>
                        {Object.keys(investor.summary).length > 0 ? (
                          <div className="flex flex-wrap gap-4">
                            {Object.entries(investor.summary).map(([stage, count]) => (
                              <div key={stage} className="flex items-center gap-2 bg-surface border border-border px-3 py-1.5 rounded text-sm">
                                <span className="text-text-secondary capitalize">{stage.replace(/_/g, ' ')}:</span>
                                <span className="font-data text-text-primary">{count}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-text-secondary">Pipeline is empty.</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}