'use client'

import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { AnimatedNumber } from './AnimatedNumber'
import { VerdictBadge } from './VerdictBadge'
import { SliderInput } from './SliderInput'
import { formatCurrency } from '@/lib/utils'
import type { RentalAnalysis, DealInputs } from '@/lib/deal-analyzer/calculations'

interface Props {
  analysis: RentalAnalysis
  inputs: DealInputs
  onChange: (updates: Partial<DealInputs>) => void
  highlightedFields?: Array<keyof DealInputs>
}

export function RentalAnalysisCard({
  analysis,
  inputs,
  onChange,
  highlightedFields = [],
}: Props) {
  const isHighlighted = (field: keyof DealInputs) => highlightedFields.includes(field)

  const rentGrowth = 0.02
  const projectionData = Array.from({ length: 120 }, (_, i) => {
    const month = i + 1
    const adjustedRent =
      analysis.effectiveMonthlyIncome * Math.pow(1 + rentGrowth / 12, month)
    const cumulativeCashFlow =
      (adjustedRent - analysis.totalMonthlyExpenses) * month -
      analysis.totalCashInvested
    return { month, cashFlow: cumulativeCashFlow }
  }).filter((_, i) => i % 6 === 0)
  const cashFlowAtFiveYears = projectionData.find((point) => point.month >= 60)?.cashFlow ?? 0
  const cashFlowAtTenYears = projectionData.find((point) => point.month >= 120)?.cashFlow ?? 0

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
            Monthly Cash Flow
          </div>
          <AnimatedNumber
            value={analysis.monthlyCashFlow}
            className={`text-2xl font-mono font-bold ${
              analysis.monthlyCashFlow >= 0 ? 'text-success' : 'text-danger'
            }`}
          />
        </div>
      </div>

      {/* Rental inputs */}
      <div className="bg-rice-50 border border-border rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-display font-semibold text-foreground">
          Rental Assumptions
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <SliderInput
            label="Monthly Rent"
            value={inputs.monthlyRent}
            onChange={(v) => onChange({ monthlyRent: v })}
            min={400}
            max={5000}
            step={50}
            highlighted={isHighlighted('monthlyRent')}
          />
          <SliderInput
            label="Vacancy Rate"
            value={inputs.vacancyRate}
            onChange={(v) => onChange({ vacancyRate: v })}
            min={0}
            max={20}
            step={1}
            format="percent"
            highlighted={isHighlighted('vacancyRate')}
          />
          <SliderInput
            label="Property Mgmt"
            value={inputs.propertyManagementPercent}
            onChange={(v) => onChange({ propertyManagementPercent: v })}
            min={0}
            max={15}
            step={0.5}
            format="percent"
            highlighted={isHighlighted('propertyManagementPercent')}
          />
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-rice-50 border border-border rounded-xl p-4 text-center">
          <div className="text-2xs text-ink-500 uppercase tracking-wider mb-1">Cap Rate</div>
          <AnimatedNumber
            value={analysis.capRate}
            format="percent"
            className={`text-xl font-mono font-bold ${
              analysis.capRate >= 8
                ? 'text-success'
                : analysis.capRate >= 5
                ? 'text-warning'
                : 'text-danger'
            }`}
          />
        </div>
        <div className="bg-rice-50 border border-border rounded-xl p-4 text-center">
          <div className="text-2xs text-ink-500 uppercase tracking-wider mb-1">Cash-on-Cash</div>
          <AnimatedNumber
            value={analysis.cashOnCashReturn}
            format="percent"
            className="text-xl font-mono font-bold text-accent"
          />
        </div>
        <div className="bg-rice-50 border border-border rounded-xl p-4 text-center">
          <div className="text-2xs text-ink-500 uppercase tracking-wider mb-1">Break Even</div>
          <AnimatedNumber
            value={analysis.breakEvenMonths === Infinity ? 999 : analysis.breakEvenMonths}
            format="months"
            className="text-xl font-mono font-bold text-foreground"
          />
        </div>
      </div>

      {/* Cash flow projection */}
      <div className="bg-rice-50 border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-display font-semibold text-foreground">
            10-Year Cash Flow Projection
          </h3>
          <span className="text-2xs font-semibold uppercase tracking-[0.08em] text-ink-500">
            Breakeven {analysis.breakEvenMonths === Infinity ? 'N/A' : `${analysis.breakEvenMonths} mo`}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border bg-surface px-3 py-2">
            <div className="text-2xs uppercase tracking-[0.08em] text-ink-500">5-Year Projection</div>
            <div
              className={`font-mono text-sm font-semibold ${
                cashFlowAtFiveYears >= 0 ? 'text-success' : 'text-danger'
              }`}
            >
              {formatCurrency(cashFlowAtFiveYears)}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface px-3 py-2">
            <div className="text-2xs uppercase tracking-[0.08em] text-ink-500">10-Year Projection</div>
            <div
              className={`font-mono text-sm font-semibold ${
                cashFlowAtTenYears >= 0 ? 'text-success' : 'text-danger'
              }`}
            >
              {formatCurrency(cashFlowAtTenYears)}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-3">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={projectionData} margin={{ left: 6, right: 8 }}>
              <defs>
                <linearGradient id="cashFlowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#27AE60" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#27AE60" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E0" vertical={false} />
              <ReferenceLine y={0} stroke="#ADB5BD" strokeDasharray="4 4" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#6C757D', fontSize: 10 }}
                tickFormatter={(v) => `${Math.round(v / 12)}yr`}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6C757D', fontSize: 10 }}
                tickFormatter={(v) => formatCurrency(v) ?? ''}
                axisLine={false}
                tickLine={false}
                width={72}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(value as number), 'Cumulative Cash Flow']}
                labelFormatter={(value) => `Month ${value}`}
                cursor={{ stroke: '#E74C3C', strokeDasharray: '3 3' }}
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
              <Area
                type="monotone"
                dataKey="cashFlow"
                stroke="#27AE60"
                fill="url(#cashFlowGrad)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="cashFlow"
                stroke="#1A1D20"
                strokeOpacity={0.15}
                strokeWidth={1}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detail rows */}
      <div className="bg-rice-50 border border-border rounded-xl divide-y divide-border">
        {([
          ['Gross Monthly Income', analysis.grossMonthlyIncome],
          ['Effective Income (after vacancy)', analysis.effectiveMonthlyIncome],
          ['Total Monthly Expenses', -analysis.totalMonthlyExpenses],
          ['Monthly Mortgage', -analysis.monthlyMortgage],
          ['Annual Cash Flow', analysis.annualCashFlow],
          ['Total Cash Invested', analysis.totalCashInvested],
        ] as const).map(([label, value]) => (
          <div key={label} className="flex justify-between items-center px-5 py-3">
            <span className="text-sm text-ink-500">{label}</span>
            <span className={`font-mono text-sm font-medium ${value < 0 ? 'text-danger' : 'text-foreground'}`}>
              {formatCurrency(value)}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
