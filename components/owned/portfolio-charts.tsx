'use client'

import { useState, useTransition } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Star } from 'lucide-react'
import clsx from 'clsx'
import { updateOwnedChartPreferences } from '@/actions/owned'
import type { OwnedAnalytics, OwnedChartId } from '@/lib/owned/types'
import { formatCurrency } from '@/lib/utils'

const ALL_CHARTS: OwnedChartId[] = ['value_vs_cost', 'pl_breakdown', 'cost_category_mix']
const CATEGORY_COLORS = ['#1D4ED8', '#0EA5E9', '#10B981', '#F59E0B', '#F97316', '#EF4444', '#6366F1', '#14B8A6']

function chartTitle(chartId: OwnedChartId): string {
  if (chartId === 'value_vs_cost') return 'Portfolio Value vs Cumulative Cost'
  if (chartId === 'pl_breakdown') return 'Profit/Loss Breakdown'
  return 'Cost Category Mix'
}

function formatTooltipCurrency(value: number | string | undefined): string {
  const parsed = typeof value === 'number' ? value : Number(value ?? 0)
  return formatCurrency(Number.isFinite(parsed) ? parsed : 0)
}

function buildCostCategoryData(analytics: OwnedAnalytics) {
  return analytics.categoryBreakdown.map((item, index) => ({
    ...item,
    fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }))
}

interface PortfolioChartsProps {
  analytics: OwnedAnalytics
  pinnedChartIds: OwnedChartId[]
}

export function PortfolioCharts({ analytics, pinnedChartIds }: PortfolioChartsProps) {
  const [favoriteChart, setFavoriteChart] = useState<OwnedChartId>(
    pinnedChartIds[0] ?? 'value_vs_cost'
  )
  const [isSavingFavorite, startFavoriteTransition] = useTransition()

  const secondaryCharts = ALL_CHARTS.filter((chartId) => chartId !== favoriteChart)
  const categoryData = buildCostCategoryData(analytics)

  const handleFavorite = (chartId: OwnedChartId) => {
    if (chartId === favoriteChart) return
    const previous = favoriteChart
    setFavoriteChart(chartId)
    startFavoriteTransition(async () => {
      try {
        await updateOwnedChartPreferences([chartId])
      } catch {
        setFavoriteChart(previous)
      }
    })
  }

  const renderChart = (chartId: OwnedChartId, featured: boolean) => {
    if (chartId === 'value_vs_cost') {
      return (
        <div className={clsx(featured ? 'h-[430px]' : 'h-[250px]')}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.trend}>
              <defs>
                <linearGradient id={`portfolioValueFill-${featured ? 'featured' : 'secondary'}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.42} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.04} />
                </linearGradient>
                <linearGradient id={`costValueFill-${featured ? 'featured' : 'secondary'}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.30} />
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.10)" />
              <XAxis dataKey="label" tick={{ fontSize: featured ? 12 : 11 }} />
              <YAxis tick={{ fontSize: featured ? 12 : 11 }} />
              <Tooltip formatter={formatTooltipCurrency} />
              <Legend />
              <Area
                type="monotone"
                dataKey="portfolioValue"
                stroke="#2563EB"
                strokeWidth={featured ? 3 : 2}
                fill={`url(#portfolioValueFill-${featured ? 'featured' : 'secondary'})`}
                name="Portfolio Value"
                isAnimationActive
                animationDuration={1100}
              />
              <Area
                type="monotone"
                dataKey="cumulativeCost"
                stroke="#DC2626"
                strokeWidth={featured ? 2.5 : 2}
                fill={`url(#costValueFill-${featured ? 'featured' : 'secondary'})`}
                name="Cumulative Cost"
                isAnimationActive
                animationDuration={900}
              />
              <Line
                type="monotone"
                dataKey="totalProfitLoss"
                stroke="#059669"
                strokeWidth={featured ? 2.2 : 1.8}
                dot={false}
                name="Total P/L"
                isAnimationActive
                animationDuration={1200}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )
    }

    if (chartId === 'pl_breakdown') {
      return (
        <div className={clsx(featured ? 'h-[430px]' : 'h-[250px]')}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.plBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.10)" />
              <XAxis dataKey="label" tick={{ fontSize: featured ? 12 : 11 }} />
              <YAxis tick={{ fontSize: featured ? 12 : 11 }} />
              <Tooltip formatter={formatTooltipCurrency} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} isAnimationActive animationDuration={900}>
                {analytics.plBreakdown.map((entry, index) => (
                  <Cell key={`${entry.label}-${index}`} fill={entry.value >= 0 ? '#16A34A' : '#DC2626'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )
    }

    return (
      <div className={clsx(featured ? 'h-[430px]' : 'h-[250px]')}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.10)" />
            <XAxis dataKey="category" tick={{ fontSize: featured ? 12 : 11 }} />
            <YAxis tick={{ fontSize: featured ? 12 : 11 }} />
            <Tooltip formatter={formatTooltipCurrency} />
            <Bar dataKey="amount" radius={[8, 8, 0, 0]} isAnimationActive animationDuration={1000}>
              {categoryData.map((entry, index) => (
                <Cell key={`${entry.category}-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h2 className="font-display text-[24px] text-text-primary">Portfolio Charts</h2>
        <span className="text-xs text-text-muted">
          {isSavingFavorite ? 'Saving favorite chart...' : 'Star a chart to feature it'}
        </span>
      </div>

      <div className="zen-card p-4 md:p-5 bg-gradient-to-br from-sky-50 via-background to-emerald-50 border-sky-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.07em] text-text-secondary">
            Featured Chart: {chartTitle(favoriteChart)}
          </h3>
          <button
            type="button"
            className="h-10 w-10 rounded-full border border-warning/40 bg-warning/10 text-warning-dark flex items-center justify-center"
            aria-label={`Favorite chart: ${chartTitle(favoriteChart)}`}
          >
            <Star className="w-4 h-4 fill-current" />
          </button>
        </div>
        {renderChart(favoriteChart, true)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {secondaryCharts.map((chartId) => (
          <div key={chartId} className="zen-card p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.07em] text-text-secondary">
                {chartTitle(chartId)}
              </h3>
              <button
                type="button"
                onClick={() => handleFavorite(chartId)}
                className="h-9 w-9 rounded-full border border-border text-text-muted hover:text-warning-dark hover:border-warning/40 transition-colors flex items-center justify-center"
                aria-label={`Set ${chartTitle(chartId)} as favorite`}
              >
                <Star className="w-4 h-4" />
              </button>
            </div>
            {renderChart(chartId, false)}
          </div>
        ))}
      </div>
    </section>
  )
}
