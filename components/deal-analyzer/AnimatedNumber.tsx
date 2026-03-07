'use client'

import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  format?: 'currency' | 'percent' | 'number' | 'months'
  className?: string
}

function formatAnimated(value: number, format: string): string {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Math.round(value))
    case 'percent':
      return `${value.toFixed(1)}%`
    case 'months':
      return `${Math.round(value)} mo`
    default:
      return Math.round(value).toLocaleString()
  }
}

export function AnimatedNumber({
  value,
  format = 'currency',
  className,
}: AnimatedNumberProps) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 })
  const display = useTransform(spring, (latest) => formatAnimated(latest, format))

  const [displayValue, setDisplayValue] = useState(() => formatAnimated(value, format))

  useEffect(() => {
    spring.set(value)
    return display.on('change', (v) => setDisplayValue(v))
  }, [value, spring, display])

  return (
    <motion.span className={className} layout>
      {displayValue}
    </motion.span>
  )
}
