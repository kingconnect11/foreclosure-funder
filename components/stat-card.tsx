import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  label: string
  value: number
  trend?: 'up' | 'down' | 'neutral'
  change?: string
}

export function StatCard({ label, value, trend, change }: StatCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-ink-400'

  return (
    <div className="zen-card p-5 lg:p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="stat-label mb-1">{label}</p>
          <p className="stat-value">{value.toLocaleString()}</p>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="w-4 h-4" />
          </div>
        )}
      </div>
      {change && (
        <p className="text-xs text-ink-500 mt-2">{change}</p>
      )}
    </div>
  )
}
