'use client'

import { motion } from 'framer-motion'
import { MapPin, Home, DollarSign } from 'lucide-react'
import { SliderInput } from './SliderInput'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import type { DealInputs } from '@/lib/deal-analyzer/calculations'

interface Props {
  inputs: DealInputs
  onChange: (updates: Partial<DealInputs>) => void
  highlightedFields?: Array<keyof DealInputs>
}

const propertyTypes = [
  'Single Family',
  'Duplex',
  'Triplex',
  'Fourplex',
  'Condo',
  'Townhouse',
]

export function PropertyInputSection({
  inputs,
  onChange,
  highlightedFields = [],
}: Props) {
  const [selectedType, setSelectedType] = useState('Single Family')
  const isHighlighted = (field: keyof DealInputs) => highlightedFields.includes(field)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="zen-card p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Home className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2 className="text-lg font-display font-bold text-foreground">
            Property Details
          </h2>
          <p className="text-xs text-ink-500">Enter the deal basics</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Address */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink-500 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" />
            Property Address
          </label>
          <input
            type="text"
            placeholder="123 Main St, Wichita, KS 67202"
            className="input-zen"
          />
        </div>

        {/* Property type */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink-500">
            Property Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {propertyTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={cn(
                  'px-3 py-2 min-h-[44px] rounded-lg text-xs font-medium border transition-all',
                  selectedType === type
                    ? 'border-accent/50 text-accent bg-accent-subtle'
                    : 'border-border text-ink-500 hover:border-accent/20 hover:text-accent'
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Financial inputs */}
        <div className="space-y-5 pt-2">
          <div className="flex items-center gap-2 text-ink-500 text-xs font-semibold uppercase tracking-wider">
            <DollarSign className="w-3.5 h-3.5" />
            Financial Inputs
          </div>

          <SliderInput
            label="Purchase Price (Foreclosure Amount)"
            value={inputs.purchasePrice}
            onChange={(v) => onChange({ purchasePrice: v })}
            min={10000}
            max={500000}
            step={5000}
            highlighted={isHighlighted('purchasePrice')}
          />
          <SliderInput
            label="After Repair Value (ARV)"
            value={inputs.arv}
            onChange={(v) => onChange({ arv: v })}
            min={20000}
            max={800000}
            step={5000}
            highlighted={isHighlighted('arv')}
          />
          <SliderInput
            label="Loan Amount"
            value={inputs.loanAmount}
            onChange={(v) => onChange({ loanAmount: v })}
            min={0}
            max={500000}
            step={5000}
            highlighted={isHighlighted('loanAmount')}
          />
          <SliderInput
            label="Interest Rate"
            value={inputs.interestRate}
            onChange={(v) => onChange({ interestRate: v })}
            min={0}
            max={18}
            step={0.25}
            format="percent"
            highlighted={isHighlighted('interestRate')}
          />
        </div>
      </div>
    </motion.div>
  )
}
