'use client'

import { cn } from '@/lib/utils'

interface SliderInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  format?: 'currency' | 'percent' | 'number' | 'months'
  className?: string
  highlighted?: boolean
}

function formatValue(value: number, format: string): string {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value)
    case 'percent':
      return `${value.toFixed(1)}%`
    case 'months':
      return `${value} months`
    default:
      return value.toLocaleString()
  }
}

export function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format = 'currency',
  className,
  highlighted = false,
}: SliderInputProps) {
  return (
    <div
      className={cn(
        'space-y-2 rounded-lg transition-all duration-300',
        highlighted && 'bg-accent/5 px-2 py-2 animate-fade-in',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-ink-500">
          {label}
        </label>
        <input
          type="text"
          value={formatValue(value, format)}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9.-]/g, '')
            const num = parseFloat(raw)
            if (!isNaN(num) && num >= min && num <= max) {
              onChange(num)
            }
          }}
          className={cn(
            `w-28 text-right bg-transparent text-accent font-mono text-sm font-semibold
                     border-b border-border focus:border-accent/50 outline-none px-1 py-0.5
                     transition-colors`,
            highlighted && 'border-accent'
          )}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={cn('deal-analyzer-slider w-full', highlighted && 'animate-pulse-soft')}
      />
      <div className="flex justify-between text-2xs text-ink-400 font-mono">
        <span>{formatValue(min, format)}</span>
        <span>{formatValue(max, format)}</span>
      </div>
    </div>
  )
}
