'use client'

import { motion } from 'framer-motion'
import { Wrench, Calculator } from 'lucide-react'
import { SliderInput } from './SliderInput'
import { cn } from '@/lib/utils'
import type { DealInputs } from '@/lib/deal-analyzer/calculations'

interface Props {
  inputs: DealInputs
  onChange: (updates: Partial<DealInputs>) => void
  highlightedFields?: Array<keyof DealInputs>
}

const rehabPresets = [
  { label: 'Cosmetic', cost: 10000, desc: 'Paint, carpet, fixtures' },
  { label: 'Light', cost: 25000, desc: 'Kitchen, bath, flooring' },
  { label: 'Medium', cost: 45000, desc: 'Full interior renovation' },
  { label: 'Heavy', cost: 75000, desc: 'Structural + full gut' },
]

export function CostBuilderSection({
  inputs,
  onChange,
  highlightedFields = [],
}: Props) {
  const isHighlighted = (field: keyof DealInputs) => highlightedFields.includes(field)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="zen-card p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Wrench className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2 className="text-lg font-display font-bold text-foreground">
            Cost Builder
          </h2>
          <p className="text-xs text-ink-500">Rehab, holding, and transaction costs</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Rehab presets */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink-500 flex items-center gap-2">
            <Wrench className="w-3.5 h-3.5" />
            Rehab Level
          </label>
          <div className="grid grid-cols-2 gap-2">
            {rehabPresets.map((preset) => {
              const isActive = inputs.rehabCost === preset.cost
              return (
                <button
                  key={preset.label}
                  onClick={() => onChange({ rehabCost: preset.cost })}
                  className={cn(
                    'relative p-3 rounded-xl border text-left transition-all',
                    isActive
                      ? 'border-accent/50 bg-accent-subtle'
                      : 'border-border hover:border-accent/20'
                  )}
                >
                  <div className={cn('text-xs font-bold', isActive ? 'text-accent' : 'text-ink-700')}>
                    {preset.label}
                  </div>
                  <div className="text-2xs text-ink-400 mt-0.5">{preset.desc}</div>
                  <div className={cn('font-mono text-sm mt-1', isActive ? 'text-accent' : 'text-ink-600')}>
                    ${preset.cost.toLocaleString()}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <SliderInput
          label="Custom Rehab Cost"
          value={inputs.rehabCost}
          onChange={(v) => onChange({ rehabCost: v })}
          min={0}
          max={150000}
          step={1000}
          highlighted={isHighlighted('rehabCost')}
        />

        <SliderInput
          label="Holding Period"
          value={inputs.holdingMonths}
          onChange={(v) => onChange({ holdingMonths: v })}
          min={1}
          max={24}
          step={1}
          format="months"
          highlighted={isHighlighted('holdingMonths')}
        />

        {/* Monthly holding costs */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-ink-500 text-xs font-semibold uppercase tracking-wider">
            <Calculator className="w-3.5 h-3.5" />
            Monthly Holding Costs
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SliderInput
              label="Property Taxes"
              value={inputs.monthlyTaxes}
              onChange={(v) => onChange({ monthlyTaxes: v })}
              min={0}
              max={1000}
              step={25}
              highlighted={isHighlighted('monthlyTaxes')}
            />
            <SliderInput
              label="Insurance"
              value={inputs.monthlyInsurance}
              onChange={(v) => onChange({ monthlyInsurance: v })}
              min={0}
              max={500}
              step={10}
              highlighted={isHighlighted('monthlyInsurance')}
            />
            <SliderInput
              label="Utilities"
              value={inputs.monthlyUtilities}
              onChange={(v) => onChange({ monthlyUtilities: v })}
              min={0}
              max={500}
              step={10}
              highlighted={isHighlighted('monthlyUtilities')}
            />
            <SliderInput
              label="Maintenance"
              value={inputs.monthlyMaintenance}
              onChange={(v) => onChange({ monthlyMaintenance: v })}
              min={0}
              max={500}
              step={10}
              highlighted={isHighlighted('monthlyMaintenance')}
            />
          </div>
        </div>

        {/* Transaction costs */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <SliderInput
            label="Closing Costs"
            value={inputs.closingCostPercent}
            onChange={(v) => onChange({ closingCostPercent: v })}
            min={0}
            max={8}
            step={0.25}
            format="percent"
            highlighted={isHighlighted('closingCostPercent')}
          />
          <SliderInput
            label="Selling Costs"
            value={inputs.sellingCostPercent}
            onChange={(v) => onChange({ sellingCostPercent: v })}
            min={0}
            max={10}
            step={0.25}
            format="percent"
            highlighted={isHighlighted('sellingCostPercent')}
          />
        </div>
      </div>
    </motion.div>
  )
}
