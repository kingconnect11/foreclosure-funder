import type {
  DealInputs,
  FlipAnalysis,
  RentalAnalysis,
  WholesaleAnalysis,
} from '@/lib/deal-analyzer/calculations'

export type DealStrategy = 'flip' | 'rental' | 'wholesale' | 'cross'
export type InsightSeverity = 'good' | 'caution' | 'risk'

export interface InsightAction {
  id: string
  label: string
  updates: Partial<DealInputs>
}

export interface DealInsight {
  id: string
  title: string
  message: string
  severity: InsightSeverity
  strategy: DealStrategy
  metric: string
  metricValue: string
  actions: InsightAction[]
}

interface InsightInputs {
  inputs: DealInputs
  flip: FlipAnalysis
  rental: RentalAnalysis
  wholesale: WholesaleAnalysis
}

const severityRank: Record<InsightSeverity, number> = {
  risk: 0,
  caution: 1,
  good: 2,
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function getDealInsights({
  inputs,
  flip,
  rental,
  wholesale,
}: InsightInputs): DealInsight[] {
  const insights: DealInsight[] = []

  if (flip.netProfit < 0) {
    insights.push({
      id: 'flip-negative-profit',
      title: 'Flip Is Currently Losing Money',
      message:
        'Your exit value does not cover total cost basis. Tighten acquisition or rehab assumptions before pursuing a flip.',
      severity: 'risk',
      strategy: 'flip',
      metric: 'Net Profit',
      metricValue: formatCurrency(flip.netProfit),
      actions: [
        {
          id: 'flip-cut-price',
          label: 'Lower Purchase Price by $10k',
          updates: { purchasePrice: inputs.purchasePrice - 10000 },
        },
        {
          id: 'flip-cut-rehab',
          label: 'Lower Rehab by $5k',
          updates: { rehabCost: inputs.rehabCost - 5000 },
        },
        {
          id: 'flip-reduce-hold',
          label: 'Reduce Holding by 1 Month',
          updates: { holdingMonths: inputs.holdingMonths - 1 },
        },
      ],
    })
  } else if (flip.roi < 10) {
    insights.push({
      id: 'flip-low-roi',
      title: 'Flip ROI Is Thin',
      message:
        'The flip works, but margin is tight for foreclosure volatility. Improve spread before committing capital.',
      severity: 'caution',
      strategy: 'flip',
      metric: 'ROI',
      metricValue: formatPercent(flip.roi),
      actions: [
        {
          id: 'flip-lift-arv',
          label: 'Raise ARV by $10k',
          updates: { arv: inputs.arv + 10000 },
        },
        {
          id: 'flip-cut-selling',
          label: 'Trim Selling Costs by 0.5%',
          updates: { sellingCostPercent: inputs.sellingCostPercent - 0.5 },
        },
      ],
    })
  } else if (flip.roi >= 25 && flip.netProfit >= 20000) {
    insights.push({
      id: 'flip-strong',
      title: 'Flip Setup Is Strong',
      message:
        'This structure has healthy spread and velocity for a value-add flip profile.',
      severity: 'good',
      strategy: 'flip',
      metric: 'Net Profit',
      metricValue: formatCurrency(flip.netProfit),
      actions: [],
    })
  }

  if (rental.monthlyCashFlow < 0) {
    insights.push({
      id: 'rental-negative-cashflow',
      title: 'Rental Cash Flow Is Negative',
      message:
        'Operating income cannot absorb current expenses. Address rent, vacancy, or financing before holding long-term.',
      severity: 'risk',
      strategy: 'rental',
      metric: 'Monthly Cash Flow',
      metricValue: formatCurrency(rental.monthlyCashFlow),
      actions: [
        {
          id: 'rental-rent-plus',
          label: 'Increase Rent by $100',
          updates: { monthlyRent: inputs.monthlyRent + 100 },
        },
        {
          id: 'rental-vacancy-down',
          label: 'Lower Vacancy by 2%',
          updates: { vacancyRate: inputs.vacancyRate - 2 },
        },
        {
          id: 'rental-mgmt-down',
          label: 'Lower Mgmt Fee by 1%',
          updates: {
            propertyManagementPercent: inputs.propertyManagementPercent - 1,
          },
        },
      ],
    })
  } else if (rental.capRate < 5) {
    insights.push({
      id: 'rental-low-cap',
      title: 'Cap Rate Is Below Target',
      message:
        'Return profile may be too soft for the risk level. Improve buy price or operating assumptions.',
      severity: 'caution',
      strategy: 'rental',
      metric: 'Cap Rate',
      metricValue: formatPercent(rental.capRate),
      actions: [
        {
          id: 'rental-price-down',
          label: 'Lower Purchase Price by $5k',
          updates: { purchasePrice: inputs.purchasePrice - 5000 },
        },
        {
          id: 'rental-maint-down',
          label: 'Lower Maintenance by $25/mo',
          updates: { monthlyMaintenance: inputs.monthlyMaintenance - 25 },
        },
      ],
    })
  } else if (rental.cashOnCashReturn >= 12 && rental.monthlyCashFlow >= 200) {
    insights.push({
      id: 'rental-strong',
      title: 'Rental Profile Looks Durable',
      message:
        'Cash flow and return thresholds are in a healthy band for a long-hold strategy.',
      severity: 'good',
      strategy: 'rental',
      metric: 'Cash-on-Cash',
      metricValue: formatPercent(rental.cashOnCashReturn),
      actions: [],
    })
  }

  if (wholesale.investorSpread < 5000) {
    insights.push({
      id: 'wholesale-thin-spread',
      title: 'Wholesale Spread Is Too Thin',
      message:
        'Your buyer likely will not accept this margin. Widen spread or compress assignment fee.',
      severity: 'risk',
      strategy: 'wholesale',
      metric: 'Investor Spread',
      metricValue: formatCurrency(wholesale.investorSpread),
      actions: [
        {
          id: 'wholesale-fee-down',
          label: 'Reduce Assignment Fee by $2k',
          updates: { wholesaleFee: inputs.wholesaleFee - 2000 },
        },
        {
          id: 'wholesale-price-down',
          label: 'Lower Purchase Price by $5k',
          updates: { purchasePrice: inputs.purchasePrice - 5000 },
        },
      ],
    })
  } else if (wholesale.investorROI < 12) {
    insights.push({
      id: 'wholesale-low-roi',
      title: 'Wholesale Buyer ROI Is Weak',
      message:
        'The assignment may move slowly unless the investor-side return improves.',
      severity: 'caution',
      strategy: 'wholesale',
      metric: 'Investor ROI',
      metricValue: formatPercent(wholesale.investorROI),
      actions: [
        {
          id: 'wholesale-rehab-down',
          label: 'Lower Rehab by $5k',
          updates: { rehabCost: inputs.rehabCost - 5000 },
        },
      ],
    })
  } else if (wholesale.assignmentFee >= 10000 && wholesale.investorSpread >= 15000) {
    insights.push({
      id: 'wholesale-strong',
      title: 'Wholesale Spread Is Attractive',
      message:
        'The buyer spread and assignment fee suggest this should be marketable to your investor list.',
      severity: 'good',
      strategy: 'wholesale',
      metric: 'Assignment Fee',
      metricValue: formatCurrency(wholesale.assignmentFee),
      actions: [],
    })
  }

  const crossScores = [
    { strategy: 'flip', score: flip.netProfit, label: 'Flip' },
    { strategy: 'rental', score: rental.annualCashFlow * 3, label: 'Rental (3yr cash flow)' },
    { strategy: 'wholesale', score: wholesale.assignmentFee, label: 'Wholesale' },
  ] as const
  const best = [...crossScores].sort((a, b) => b.score - a.score)[0]

  insights.push({
    id: 'cross-best-strategy',
    title: `Best Current Angle: ${best.label}`,
    message:
      best.strategy === 'flip'
        ? 'Flip has the strongest upside right now based on modeled net outcome.'
        : best.strategy === 'rental'
          ? 'Rental has the strongest durability in projected cash generation.'
          : 'Wholesale has the clearest near-term monetization path.',
    severity: 'good',
    strategy: 'cross',
    metric: 'Best Outcome',
    metricValue: formatCurrency(best.score),
    actions: [],
  })

  const strongCount = [flip.verdict, rental.verdict, wholesale.verdict].filter(
    (v) => v === 'strong'
  ).length
  if (strongCount === 0) {
    insights.push({
      id: 'cross-no-strong',
      title: 'No Strategy Is Strong Yet',
      message:
        'Treat this as an active workup. Use guided actions to move at least one strategy into a strong zone.',
      severity: 'caution',
      strategy: 'cross',
      metric: 'Strong Strategies',
      metricValue: '0',
      actions: [],
    })
  }

  return insights.sort((a, b) => {
    const severityDelta = severityRank[a.severity] - severityRank[b.severity]
    if (severityDelta !== 0) return severityDelta
    return a.title.localeCompare(b.title)
  })
}
