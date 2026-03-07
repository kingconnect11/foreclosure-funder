'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  HandCoins,
  Hammer,
  Calculator,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react'
import { PropertyInputSection } from '@/components/deal-analyzer/PropertyInputSection'
import { CostBuilderSection } from '@/components/deal-analyzer/CostBuilderSection'
import { FlipAnalysisCard } from '@/components/deal-analyzer/FlipAnalysisCard'
import { RentalAnalysisCard } from '@/components/deal-analyzer/RentalAnalysisCard'
import { WholesaleAnalysisCard } from '@/components/deal-analyzer/WholesaleAnalysisCard'
import { GuidedInsightsPanel } from '@/components/deal-analyzer/GuidedInsightsPanel'
import {
  calculateFlip,
  calculateRental,
  calculateWholesale,
  type DealInputs,
} from '@/lib/deal-analyzer/calculations'
import { getDealInsights, type InsightAction } from '@/lib/deal-analyzer/insights'
import { cn, formatCurrency } from '@/lib/utils'

type AnalysisTab = 'flip' | 'rental' | 'wholesale'
type InsightFilter = 'all' | AnalysisTab | 'cross'
type DealInputKey = keyof DealInputs

const tabs: { id: AnalysisTab; label: string; icon: typeof Hammer }[] = [
  { id: 'flip', label: 'Flip', icon: Hammer },
  { id: 'rental', label: 'Rental', icon: Building2 },
  { id: 'wholesale', label: 'Wholesale', icon: HandCoins },
]

const inputBounds: Record<DealInputKey, { min: number; max: number }> = {
  purchasePrice: { min: 10000, max: 500000 },
  arv: { min: 20000, max: 800000 },
  rehabCost: { min: 0, max: 150000 },
  holdingMonths: { min: 1, max: 24 },
  monthlyTaxes: { min: 0, max: 1000 },
  monthlyInsurance: { min: 0, max: 500 },
  monthlyUtilities: { min: 0, max: 500 },
  closingCostPercent: { min: 0, max: 8 },
  sellingCostPercent: { min: 0, max: 10 },
  loanAmount: { min: 0, max: 500000 },
  interestRate: { min: 0, max: 18 },
  monthlyRent: { min: 400, max: 5000 },
  vacancyRate: { min: 0, max: 20 },
  monthlyMaintenance: { min: 0, max: 500 },
  propertyManagementPercent: { min: 0, max: 15 },
  wholesaleFee: { min: 1000, max: 30000 },
}

const defaultInputs: DealInputs = {
  purchasePrice: 85000,
  arv: 165000,
  rehabCost: 25000,
  holdingMonths: 4,
  monthlyTaxes: 150,
  monthlyInsurance: 100,
  monthlyUtilities: 75,
  closingCostPercent: 3,
  sellingCostPercent: 6,
  loanAmount: 0,
  interestRate: 8,
  monthlyRent: 1200,
  vacancyRate: 8,
  monthlyMaintenance: 100,
  propertyManagementPercent: 10,
  wholesaleFee: 10000,
}

export default function DealAnalyzerPage() {
  const [inputs, setInputs] = useState<DealInputs>(defaultInputs)
  const [activeTab, setActiveTab] = useState<AnalysisTab>('flip')
  const [insightFilter, setInsightFilter] = useState<InsightFilter>('all')
  const [highlightedFields, setHighlightedFields] = useState<DealInputKey[]>([])
  const [undoPatch, setUndoPatch] = useState<Partial<DealInputs> | null>(null)

  const handleChange = (updates: Partial<DealInputs>) => {
    setInputs((prev) => ({ ...prev, ...updates }))
  }

  const flipAnalysis = useMemo(() => calculateFlip(inputs), [inputs])
  const rentalAnalysis = useMemo(() => calculateRental(inputs), [inputs])
  const wholesaleAnalysis = useMemo(() => calculateWholesale(inputs), [inputs])
  const insights = useMemo(
    () =>
      getDealInsights({
        inputs,
        flip: flipAnalysis,
        rental: rentalAnalysis,
        wholesale: wholesaleAnalysis,
      }),
    [inputs, flipAnalysis, rentalAnalysis, wholesaleAnalysis]
  )

  const filteredInsights = useMemo(
    () =>
      insightFilter === 'all'
        ? insights
        : insights.filter((insight) => insight.strategy === insightFilter),
    [insightFilter, insights]
  )

  const health = useMemo(
    () =>
      insights.reduce(
        (acc, insight) => {
          acc[insight.severity] += 1
          return acc
        },
        { risk: 0, caution: 0, good: 0 }
      ),
    [insights]
  )

  const clampInputValue = (field: DealInputKey, value: number) => {
    const bounds = inputBounds[field]
    return Math.min(bounds.max, Math.max(bounds.min, value))
  }

  const handleApplyAction = (action: InsightAction) => {
    const fields = Object.keys(action.updates) as DealInputKey[]
    if (fields.length === 0) return

    const previousValues: Partial<DealInputs> = {}
    const nextInputs = { ...inputs }

    fields.forEach((field) => {
      const update = action.updates[field]
      previousValues[field] = inputs[field]
      if (typeof update === 'number') {
        nextInputs[field] = clampInputValue(field, update)
      }
    })

    setUndoPatch(previousValues)
    setInputs(nextInputs)
    setHighlightedFields(fields)
  }

  const handleUndoLast = () => {
    if (!undoPatch) return

    const fields = Object.keys(undoPatch) as DealInputKey[]
    if (fields.length === 0) return

    const nextInputs = { ...inputs }
    fields.forEach((field) => {
      const previous = undoPatch[field]
      if (typeof previous === 'number') {
        nextInputs[field] = previous
      }
    })

    setInputs(nextInputs)
    setHighlightedFields(fields)
    setUndoPatch(null)
  }

  useEffect(() => {
    if (highlightedFields.length === 0) return
    const timer = window.setTimeout(() => setHighlightedFields([]), 1200)
    return () => window.clearTimeout(timer)
  }, [highlightedFields])

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface via-rice-50 to-accent/10 p-6 shadow-zen">
        <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-accent/10 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-info/10 blur-2xl" />

        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-2xs font-semibold uppercase tracking-[0.08em] text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              Investment Playground
            </div>

            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-accent text-white flex items-center justify-center shadow-zen-lg">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-[30px] leading-tight font-display font-bold text-foreground">
                  Deal Analyzer
                </h1>
                <p className="text-sm text-ink-600">
                  Model flips, rentals, and wholesale exits with guided strategy feedback.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-xl border border-border bg-surface/80 p-3 shadow-zen">
            <div className="rounded-lg bg-rice-50 px-3 py-2 text-center">
              <div className="text-2xs uppercase tracking-[0.08em] text-ink-500">Buy</div>
              <div className="font-mono text-sm font-semibold text-foreground">
                {formatCurrency(inputs.purchasePrice)}
              </div>
            </div>
            <div className="rounded-lg bg-rice-50 px-3 py-2 text-center">
              <div className="text-2xs uppercase tracking-[0.08em] text-ink-500">ARV</div>
              <div className="font-mono text-sm font-semibold text-accent">
                {formatCurrency(inputs.arv)}
              </div>
            </div>
            <div className="rounded-lg bg-rice-50 px-3 py-2 text-center">
              <div className="text-2xs uppercase tracking-[0.08em] text-ink-500">Spread</div>
              <div
                className={cn(
                  'font-mono text-sm font-semibold',
                  inputs.arv - inputs.purchasePrice - inputs.rehabCost >= 0
                    ? 'text-success'
                    : 'text-danger'
                )}
              >
                {formatCurrency(inputs.arv - inputs.purchasePrice - inputs.rehabCost)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="rounded-2xl border border-border bg-surface p-4 shadow-zen">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.07em] text-ink-500">
              Deal Health
            </p>
            <p className="text-sm text-foreground">
              {health.risk > 0
                ? 'High-risk assumptions detected'
                : health.caution > 0
                  ? 'Promising, but needs tuning'
                  : 'Strong setup across current assumptions'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-danger/20 bg-danger/10 px-2.5 py-1 text-danger">
              <ShieldAlert className="h-3.5 w-3.5" />
              {health.risk} Risk
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/20 bg-warning/10 px-2.5 py-1 text-warning-dark">
              <AlertTriangle className="h-3.5 w-3.5" />
              {health.caution} Caution
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-success">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {health.good} Good
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-6">
          <PropertyInputSection
            inputs={inputs}
            onChange={handleChange}
            highlightedFields={highlightedFields}
          />
          <CostBuilderSection
            inputs={inputs}
            onChange={handleChange}
            highlightedFields={highlightedFields}
          />
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-2 shadow-zen">
            <div className="grid grid-cols-3 gap-1.5">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id
                const Icon = tab.icon

                const metric =
                  tab.id === 'flip'
                    ? {
                        label: 'Net Profit',
                        value: formatCurrency(flipAnalysis.netProfit),
                        tone: flipAnalysis.netProfit >= 0 ? 'text-success' : 'text-danger',
                      }
                    : tab.id === 'rental'
                      ? {
                          label: 'Cash Flow',
                          value: `${formatCurrency(rentalAnalysis.monthlyCashFlow)}/mo`,
                          tone:
                            rentalAnalysis.monthlyCashFlow >= 0
                              ? 'text-success'
                              : 'text-danger',
                        }
                      : {
                          label: 'Assignment',
                          value: formatCurrency(wholesaleAnalysis.assignmentFee),
                          tone: 'text-accent',
                        }

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'relative rounded-xl px-3 py-3.5 min-h-[74px] text-left transition-all',
                      isActive
                        ? 'bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 shadow-zen'
                        : 'bg-rice-50/70 border border-transparent hover:border-border'
                    )}
                  >
                    <div className="relative z-10 flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                          <Icon className="h-4 w-4" />
                          <span>{tab.label}</span>
                        </div>
                        <div className="text-2xs uppercase tracking-[0.07em] text-ink-500">
                          {metric.label}
                        </div>
                        <div className={cn('font-mono text-sm font-semibold', metric.tone)}>
                          {metric.value}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <GuidedInsightsPanel
            insights={filteredInsights}
            filter={insightFilter}
            onFilterChange={setInsightFilter}
            onApplyAction={handleApplyAction}
            onUndo={handleUndoLast}
            canUndo={Boolean(undoPatch)}
          />

          <div className="rounded-2xl border border-border bg-surface p-6 shadow-zen">
            <AnimatePresence mode="wait">
              {activeTab === 'flip' && (
                <motion.div
                  key="flip"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <FlipAnalysisCard analysis={flipAnalysis} />
                </motion.div>
              )}
              {activeTab === 'rental' && (
                <motion.div
                  key="rental"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <RentalAnalysisCard
                    analysis={rentalAnalysis}
                    inputs={inputs}
                    onChange={handleChange}
                    highlightedFields={highlightedFields}
                  />
                </motion.div>
              )}
              {activeTab === 'wholesale' && (
                <motion.div
                  key="wholesale"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <WholesaleAnalysisCard
                    analysis={wholesaleAnalysis}
                    inputs={inputs}
                    onChange={handleChange}
                    highlightedFields={highlightedFields}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-zen">
            <h3 className="text-sm font-display font-semibold text-foreground mb-4">
              Strategy Comparison
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setActiveTab('flip')}
                className={cn(
                  'relative overflow-hidden bg-rice-50 border rounded-xl p-4 text-center transition-all',
                  activeTab === 'flip'
                    ? 'border-accent/30 shadow-zen-lg'
                    : 'border-border hover:border-border-strong'
                )}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-success/70 to-success/20" />
                <Hammer className="w-5 h-5 text-accent mx-auto mb-2" />
                <div className="text-xs text-ink-500 mb-1">Flip Profit</div>
                <div
                  className={cn(
                    'font-mono text-lg font-bold',
                    flipAnalysis.netProfit >= 0 ? 'text-success' : 'text-danger'
                  )}
                >
                  {formatCurrency(flipAnalysis.netProfit)}
                </div>
                <div className="text-2xs text-ink-400 mt-1 font-mono">
                  {flipAnalysis.roi.toFixed(1)}% ROI
                </div>
              </button>

              <button
                onClick={() => setActiveTab('rental')}
                className={cn(
                  'relative overflow-hidden bg-rice-50 border rounded-xl p-4 text-center transition-all',
                  activeTab === 'rental'
                    ? 'border-accent/30 shadow-zen-lg'
                    : 'border-border hover:border-border-strong'
                )}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-info/70 to-info/20" />
                <Building2 className="w-5 h-5 text-info mx-auto mb-2" />
                <div className="text-xs text-ink-500 mb-1">Monthly Cash Flow</div>
                <div
                  className={cn(
                    'font-mono text-lg font-bold',
                    rentalAnalysis.monthlyCashFlow >= 0 ? 'text-success' : 'text-danger'
                  )}
                >
                  {formatCurrency(rentalAnalysis.monthlyCashFlow)}
                </div>
                <div className="text-2xs text-ink-400 mt-1 font-mono">
                  {rentalAnalysis.capRate.toFixed(1)}% Cap Rate
                </div>
              </button>

              <button
                onClick={() => setActiveTab('wholesale')}
                className={cn(
                  'relative overflow-hidden bg-rice-50 border rounded-xl p-4 text-center transition-all',
                  activeTab === 'wholesale'
                    ? 'border-accent/30 shadow-zen-lg'
                    : 'border-border hover:border-border-strong'
                )}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo/80 to-indigo/30" />
                <HandCoins className="w-5 h-5 text-indigo mx-auto mb-2" />
                <div className="text-xs text-ink-500 mb-1">Assignment Fee</div>
                <div className="font-mono text-lg font-bold text-accent">
                  {formatCurrency(wholesaleAnalysis.assignmentFee)}
                </div>
                <div className="text-2xs text-ink-400 mt-1 font-mono">
                  {wholesaleAnalysis.investorROI.toFixed(1)}% Investor ROI
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-ink-400 text-center pt-4">
        For estimation purposes only. Not financial advice.
      </p>
    </div>
  )
}
