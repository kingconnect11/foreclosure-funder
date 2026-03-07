'use client'

import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { AnimatedNumber } from './AnimatedNumber'
import { VerdictBadge } from './VerdictBadge'
import { formatCurrency } from '@/lib/utils'
import type { FlipAnalysis } from '@/lib/deal-analyzer/calculations'

interface Props {
  analysis: FlipAnalysis
}

export function FlipAnalysisCard({ analysis }: Props) {
  const breakdownData = [
    { name: 'Purchase', value: analysis.totalInvestment, color: '#3498DB' },
    { name: 'Holding', value: analysis.holdingCosts, color: '#F39C12' },
    { name: 'Closing', value: analysis.closingCosts, color: '#4F46E5' },
    { name: 'Selling', value: analysis.sellingCosts, color: '#E74C3C' },
    { name: 'Net Profit', value: Math.max(0, analysis.netProfit), color: '#27AE60' },
  ]
  const legendItems = breakdownData.filter((item) => item.value > 0)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Verdict and key metrics */}
      <div className="flex items-center justify-between">
        <VerdictBadge verdict={analysis.verdict} />
        <div className="text-right">
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-500">
            Net Profit
          </div>
          <AnimatedNumber
            value={analysis.netProfit}
            className={`text-2xl font-mono font-bold ${
              analysis.netProfit >= 0 ? 'text-success' : 'text-danger'
            }`}
          />
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-rice-50 border border-border rounded-xl p-4 text-center">
          <div className="text-2xs text-ink-500 uppercase tracking-wider mb-1">
            ROI
          </div>
          <AnimatedNumber
            value={analysis.roi}
            format="percent"
            className={`text-xl font-mono font-bold ${
              analysis.roi >= 25
                ? 'text-success'
                : analysis.roi >= 10
                ? 'text-warning'
                : 'text-danger'
            }`}
          />
        </div>
        <div className="bg-rice-50 border border-border rounded-xl p-4 text-center">
          <div className="text-2xs text-ink-500 uppercase tracking-wider mb-1">
            Annualized
          </div>
          <AnimatedNumber
            value={analysis.annualizedRoi}
            format="percent"
            className="text-xl font-mono font-bold text-accent"
          />
        </div>
        <div className="bg-rice-50 border border-border rounded-xl p-4 text-center">
          <div className="text-2xs text-ink-500 uppercase tracking-wider mb-1">
            Profit / Mo
          </div>
          <AnimatedNumber
            value={analysis.profitPerMonth}
            className="text-xl font-mono font-bold text-foreground"
          />
        </div>
      </div>

      {/* Cost breakdown chart */}
      <div className="bg-rice-50 border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-display font-semibold text-foreground">
            Cost Breakdown
          </h3>
          <span className="text-2xs font-semibold uppercase tracking-[0.08em] text-ink-500">
            Total Basis {formatCurrency(analysis.totalCostBasis)}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {legendItems.map((item) => (
            <div
              key={item.name}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-2xs font-medium text-ink-600"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-surface border border-border p-3">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={breakdownData} layout="vertical" margin={{ left: 6, right: 8 }}>
              <defs>
                <linearGradient id="flipChartBackdrop" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#FAFAF8" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E8E8E0" />
              <XAxis
                type="number"
                tick={{ fill: '#6C757D', fontSize: 10 }}
                tickFormatter={(v) => formatCurrency(v) ?? ''}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#495057', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={72}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value as number)}
                cursor={{ fill: 'rgba(231, 76, 60, 0.08)' }}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E8E8E0',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#1A1D20',
                  boxShadow: '0 6px 14px -6px rgb(0 0 0 / 0.18)',
                }}
                labelStyle={{ color: '#6C757D', fontSize: '11px', fontWeight: 600 }}
              />
              <Bar dataKey="value" radius={[0, 7, 7, 0]} barSize={20}>
                {breakdownData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detail rows */}
      <div className="bg-rice-50 border border-border rounded-xl divide-y divide-border">
        {([
          ['Total Investment', analysis.totalInvestment],
          ['Holding Costs', analysis.holdingCosts],
          ['Closing Costs', analysis.closingCosts],
          ['Selling Costs', analysis.sellingCosts],
          ['Total Cost Basis', analysis.totalCostBasis],
          ['Gross Profit', analysis.grossProfit],
        ] as const).map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between items-center px-5 py-3"
          >
            <span className="text-sm text-ink-500">{label}</span>
            <span
              className={`font-mono text-sm font-medium ${
                value < 0 ? 'text-danger' : 'text-foreground'
              }`}
            >
              {formatCurrency(value)}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
