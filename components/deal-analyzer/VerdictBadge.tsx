'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { TrendingUp, AlertTriangle, XCircle } from 'lucide-react'

type Verdict = 'strong' | 'marginal' | 'pass'

const config = {
  strong: {
    label: 'STRONG DEAL',
    icon: TrendingUp,
    classes: 'bg-success/10 border-success/30 text-success',
  },
  marginal: {
    label: 'MARGINAL',
    icon: AlertTriangle,
    classes: 'bg-warning/10 border-warning/30 text-warning',
  },
  pass: {
    label: 'PASS',
    icon: XCircle,
    classes: 'bg-danger/10 border-danger/30 text-danger',
  },
}

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const c = config[verdict]
  const Icon = c.icon

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full border font-mono text-sm font-bold tracking-wider',
        c.classes
      )}
    >
      <Icon className="w-4 h-4" />
      {c.label}
    </motion.div>
  )
}
