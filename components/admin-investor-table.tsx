'use client'

import React, { useState } from 'react'
import { Profile } from '@/lib/types'
import { ChevronDown, ChevronUp } from 'lucide-react'

type InvestorWithSummary = Profile & {
  summary: Record<string, number>
}

const ACTIVE_STAGES = ['researching', 'site_visit', 'preparing_offer', 'offer_submitted', 'counter_offered', 'offer_accepted', 'in_closing']

export function AdminInvestorTable({ investors }: { investors: InvestorWithSummary[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="dossier-card overflow-x-auto">
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr className="border-b-2 border-border">
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.1em] text-text-secondary">Name</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.1em] text-text-secondary">Email</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.1em] text-text-secondary">Tier</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.1em] text-text-secondary">Saved</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.1em] text-text-secondary">Active Deals</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.1em] text-text-secondary">Last Active</th>
            <th className="px-6 py-4"></th>
          </tr>
        </thead>
        <tbody className="text-sm font-body">
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
                  className={`border-b border-border transition-colors cursor-pointer ${isExpanded ? 'bg-surface-elevated' : 'hover:bg-surface-elevated/50'}`}
                >
                  <td className="px-6 py-5 font-semibold text-text-primary">{investor.full_name || 'Unnamed'}</td>
                  <td className="px-6 py-5 text-text-secondary">{investor.email}</td>
                  <td className="px-6 py-5">
                    <span className="inline-block px-2 py-1 rounded-sm text-[10px] tracking-[0.1em] font-bold uppercase border bg-background text-text-secondary border-border">
                      {investor.subscription_tier}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-data text-text-primary">{totalSaved}</td>
                  <td className="px-6 py-5 font-data text-accent">{activeDeals}</td>
                  <td className="px-6 py-5 text-text-muted font-data">
                    {investor.updated_at ? new Date(investor.updated_at).toLocaleDateString() : '--'}
                  </td>
                  <td className="px-6 py-5 text-text-muted text-right">
                    {isExpanded ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />}
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="bg-background border-b-2 border-border">
                    <td colSpan={7} className="px-6 py-8">
                      <div className="flex flex-col gap-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Pipeline Summary</span>
                        {Object.keys(investor.summary).length > 0 ? (
                          <div className="flex flex-wrap gap-4">
                            {Object.entries(investor.summary).map(([stage, count]) => (
                              <div key={stage} className="flex items-center justify-between min-w-[160px] ledger-divider pb-1">
                                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{stage.replace(/_/g, ' ')}</span>
                                <span className="font-data text-sm text-text-primary">{count}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-text-secondary italic">Pipeline is currently empty.</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
          {investors.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-text-muted">No investors registered in this deal room.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
