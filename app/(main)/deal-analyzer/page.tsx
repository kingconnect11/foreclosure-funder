'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeftRight,
  Building2,
  HandCoins,
  Hammer,
  Calculator,
} from 'lucide-react'
import { PropertyInputSection } from '@/components/deal-analyzer/PropertyInputSection'
import { CostBuilderSection } from '@/components/deal-analyzer/CostBuilderSection'
import { FlipAnalysisCard } from '@/components/deal-analyzer/FlipAnalysisCard'
import { RentalAnalysisCard } from '@/components/deal-analyzer/RentalAnalysisCard'
import { WholesaleAnalysisCard } from '@/components/deal-analyzer/WholesaleAnalysisCard'
import {
  calculateFlip,
  calculateRental,
  calculateWholesale,
  type DealInputs,
} from '@/lib/deal-analyzer/calculations'
import { cn, formatCurrency } from '@/lib/utils'

type AnalysisTab = 'flip' | 'rental' | 'wholesale'

const tabs: { id: AnalysisTab; label: string; icon: typeof Hammer }[] = [
  { id: 'flip', label: 'Flip', icon: Hammer },
  { id: 'rental', label: 'Rental', icon: Building2 },
  { id: 'wholesale', label: 'Wholesale', icon: HandCoins },
]

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

  const handleChange = (updates: Partial<DealInputs>) => {
    setInputs((prev) => ({ ...prev, ...updates }))
  }

  const flipAnalysis = useMemo(() => calculateFlip(inputs), [inputs])
  const rentalAnalysis = useMemo(() => calculateRental(inputs), [inputs])
  const wholesaleAnalysis = useMemo(() => calculateWholesale(inputs), [inputs])

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Deal Analyzer
            </h1>
            <p className="text-sm text-ink-500">
              Run the numbers on any foreclosure deal
            </p>
          </div>
        </div>

        {/* Quick summary pill */}
        <div className="hidden md:flex items-center gap-4 px-5 py-2.5 zen-card">
          <div className="text-center">
            <div className="text-2xs text-ink-400 uppercase font-semibold">Buy</div>
            <div className="font-mono text-xs font-semibold text-foreground">
              {formatCurrency(inputs.purchasePrice)}
            </div>
          </div>
          <ArrowLeftRight className="w-3.5 h-3.5 text-ink-300" />
          <div className="text-center">
            <div className="text-2xs text-ink-400 uppercase font-semibold">ARV</div>
            <div className="font-mono text-xs font-semibold text-accent">
              {formatCurrency(inputs.arv)}
            </div>
          </div>
          <ArrowLeftRight className="w-3.5 h-3.5 text-ink-300" />
          <div className="text-center">
            <div className="text-2xs text-ink-400 uppercase font-semibold">Spread</div>
            <div
              className={cn(
                'font-mono text-xs font-semibold',
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

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <PropertyInputSection inputs={inputs} onChange={handleChange} />
          <CostBuilderSection inputs={inputs} onChange={handleChange} />
        </div>

        {/* Right: Analysis */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tab selector */}
          <div className="zen-card p-1.5 flex gap-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'relative flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'text-accent'
                      : 'text-ink-500 hover:text-ink-700'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-accent-subtle border border-accent/20 rounded-lg"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10 font-display">{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Analysis cards */}
          <div className="zen-card p-6">
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
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Strategy comparison */}
          <div className="zen-card p-5">
            <h3 className="text-sm font-display font-semibold text-foreground mb-4">
              Strategy Comparison
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setActiveTab('flip')}
                className={cn(
                  'bg-rice-50 border rounded-xl p-4 text-center transition-all',
                  activeTab === 'flip' ? 'border-accent/30 shadow-zen-lg' : 'border-border hover:border-border-strong'
                )}
              >
                <Hammer className="w-5 h-5 text-accent mx-auto mb-2" />
                <div className="text-xs text-ink-500 mb-1">Flip Profit</div>
                <div className={cn('font-mono text-lg font-bold', flipAnalysis.netProfit >= 0 ? 'text-success' : 'text-danger')}>
                  {formatCurrency(flipAnalysis.netProfit)}
                </div>
                <div className="text-2xs text-ink-400 mt-1 font-mono">
                  {flipAnalysis.roi.toFixed(1)}% ROI
                </div>
              </button>

              <button
                onClick={() => setActiveTab('rental')}
                className={cn(
                  'bg-rice-50 border rounded-xl p-4 text-center transition-all',
                  activeTab === 'rental' ? 'border-accent/30 shadow-zen-lg' : 'border-border hover:border-border-strong'
                )}
              >
                <Building2 className="w-5 h-5 text-info mx-auto mb-2" />
                <div className="text-xs text-ink-500 mb-1">Monthly Cash Flow</div>
                <div className={cn('font-mono text-lg font-bold', rentalAnalysis.monthlyCashFlow >= 0 ? 'text-success' : 'text-danger')}>
                  {formatCurrency(rentalAnalysis.monthlyCashFlow)}
                </div>
                <div className="text-2xs text-ink-400 mt-1 font-mono">
                  {rentalAnalysis.capRate.toFixed(1)}% Cap Rate
                </div>
              </button>

              <button
                onClick={() => setActiveTab('wholesale')}
                className={cn(
                  'bg-rice-50 border rounded-xl p-4 text-center transition-all',
                  activeTab === 'wholesale' ? 'border-accent/30 shadow-zen-lg' : 'border-border hover:border-border-strong'
                )}
              >
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

      {/* Disclaimer */}
      <p className="text-xs text-ink-400 text-center pt-4">
        For estimation purposes only. Not financial advice.
      </p>
    </div>
  )
}
