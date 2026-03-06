'use client'

import { motion } from 'framer-motion'
import { AnimatedNumber } from './AnimatedNumber'
import { VerdictBadge } from './VerdictBadge'
import { SliderInput } from './SliderInput'
import { formatCurrency } from '@/lib/utils'
import type { WholesaleAnalysis, DealInputs } from '@/lib/deal-analyzer/calculations'

interface Props {
  analysis: WholesaleAnalysis
  inputs: DealInputs
  onChange: (updates: Partial<DealInputs>) => void
}

export function WholesaleAnalysisCard({ analysis, inputs, onChange }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Verdict */}
      <div className="flex items-center justify-between">
        <VerdictBadge verdict={analysis.verdict} />
        <div className="text-right">
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-500">
            Assignment Fee
          </div>
          <AnimatedNumber
            value={analysis.assignmentFee}
            className="text-2xl font-mono font-bold text-accent"
          />
        </div>
      </div>

      {/* Wholesale input */}
      <div className="bg-rice-50 border border-border rounded-xl p-5">
        <SliderInput
          label="Your Assignment Fee"
          value={inputs.wholesaleFee}
          onChange={(v) => onChange({ wholesaleFee: v })}
          min={1000}
          max={30000}
          step={500}
        />
      </div>

      {/* Deal stack */}
      <div className="bg-rice-50 border border-border rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-display font-semibold text-foreground">
          Deal Stack
        </h3>
        <div className="space-y-3">
          {[
            { label: 'After Repair Value', value: inputs.arv, pct: 100, color: 'from-emerald-500 to-emerald-300', textColor: 'text-success' },
            { label: '70% Rule Max Offer (ARV x 0.7 - Rehab)', value: analysis.investorMaxOffer, pct: Math.max(0, Math.min(100, (analysis.investorMaxOffer / inputs.arv) * 100)), color: 'from-amber-500 to-amber-300', textColor: 'text-warning' },
            { label: 'Investor Pays (Purchase + Your Fee)', value: analysis.investorPurchasePrice, pct: Math.max(0, Math.min(100, (analysis.investorPurchasePrice / inputs.arv) * 100)), color: 'from-blue-500 to-blue-300', textColor: 'text-info' },
            { label: 'Rehab Cost', value: inputs.rehabCost, pct: Math.max(0, Math.min(100, (inputs.rehabCost / inputs.arv) * 100)), color: 'from-violet-500 to-violet-300', textColor: 'text-indigo' },
          ].map((item, i) => (
            <div key={item.label}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-ink-500">{item.label}</span>
                <span className={`font-mono ${item.textColor}`}>
                  {formatCurrency(item.value)}
                </span>
              </div>
              <div className="h-7 rounded-lg bg-rice-200 overflow-hidden">
                <motion.div
                  className={`h-full rounded-lg bg-gradient-to-r ${item.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.pct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.1 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-rice-50 border border-border rounded-xl p-4 text-center">
          <div className="text-2xs text-ink-500 uppercase tracking-wider mb-1">Investor Spread</div>
          <AnimatedNumber
            value={analysis.investorSpread}
            className={`text-xl font-mono font-bold ${
              analysis.investorSpread >= 15000
                ? 'text-success'
                : analysis.investorSpread >= 5000
                ? 'text-warning'
                : 'text-danger'
            }`}
          />
        </div>
        <div className="bg-rice-50 border border-border rounded-xl p-4 text-center">
          <div className="text-2xs text-ink-500 uppercase tracking-wider mb-1">Investor ROI</div>
          <AnimatedNumber
            value={analysis.investorROI}
            format="percent"
            className="text-xl font-mono font-bold text-accent"
          />
        </div>
      </div>

      {/* Detail rows */}
      <div className="bg-rice-50 border border-border rounded-xl divide-y divide-border">
        {([
          ['Foreclosure Price', inputs.purchasePrice],
          ['Your Assignment Fee', analysis.assignmentFee],
          ['Investor Purchase Price', analysis.investorPurchasePrice],
          ['Rehab Cost', inputs.rehabCost],
          ['After Repair Value', inputs.arv],
          ['Investor Total In', analysis.investorPurchasePrice + inputs.rehabCost],
          ['Investor Gross Profit', inputs.arv - analysis.investorPurchasePrice - inputs.rehabCost],
        ] as const).map(([label, value]) => (
          <div key={label} className="flex justify-between items-center px-5 py-3">
            <span className="text-sm text-ink-500">{label}</span>
            <span className="font-mono text-sm font-medium text-foreground">
              {formatCurrency(value)}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
