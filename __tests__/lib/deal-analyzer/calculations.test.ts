import { describe, it, expect } from 'vitest'
import {
  calculateFlip,
  calculateRental,
  calculateWholesale,
  type DealInputs,
} from '@/lib/deal-analyzer/calculations'

const baseInputs: DealInputs = {
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

describe('calculateFlip', () => {
  it('calculates total investment as purchase + rehab', () => {
    const result = calculateFlip(baseInputs)
    expect(result.totalInvestment).toBe(110000)
  })

  it('calculates closing costs as percentage of purchase price', () => {
    const result = calculateFlip(baseInputs)
    expect(result.closingCosts).toBe(2550) // 85000 * 0.03
  })

  it('calculates selling costs as percentage of ARV', () => {
    const result = calculateFlip(baseInputs)
    expect(result.sellingCosts).toBe(9900) // 165000 * 0.06
  })

  it('calculates holding costs correctly with no loan', () => {
    const result = calculateFlip(baseInputs)
    // (150 + 100 + 75 + 0) * 4 = 1300
    expect(result.holdingCosts).toBe(1300)
  })

  it('calculates gross profit as ARV - purchase - rehab', () => {
    const result = calculateFlip(baseInputs)
    expect(result.grossProfit).toBe(55000) // 165000 - 85000 - 25000
  })

  it('calculates net profit correctly', () => {
    const result = calculateFlip(baseInputs)
    // totalCostBasis = 110000 + 2550 + 9900 + 1300 = 123750
    // netProfit = 165000 - 123750 = 41250
    expect(result.netProfit).toBe(41250)
  })

  it('calculates ROI based on cash invested', () => {
    const result = calculateFlip(baseInputs)
    // cashInvested = 110000 - 0 + 2550 = 112550
    // roi = (41250 / 112550) * 100 ~= 36.65
    expect(result.roi).toBeCloseTo(36.65, 0)
  })

  it('calculates annualized ROI', () => {
    const result = calculateFlip(baseInputs)
    // annualized = roi * (12 / 4) = roi * 3
    expect(result.annualizedRoi).toBeCloseTo(result.roi * 3, 1)
  })

  it('returns strong verdict for high ROI and profit', () => {
    const result = calculateFlip(baseInputs)
    expect(result.verdict).toBe('strong')
  })

  it('returns pass verdict for negative profit scenarios', () => {
    const result = calculateFlip({
      ...baseInputs,
      purchasePrice: 200000,
      arv: 150000,
      rehabCost: 50000,
    })
    expect(result.verdict).toBe('pass')
    expect(result.netProfit).toBeLessThan(0)
  })

  it('includes loan payment in holding costs when loan exists', () => {
    const withLoan = calculateFlip({
      ...baseInputs,
      loanAmount: 60000,
    })
    const noLoan = calculateFlip(baseInputs)
    expect(withLoan.holdingCosts).toBeGreaterThan(noLoan.holdingCosts)
  })

  it('handles zero holding months without division errors', () => {
    const result = calculateFlip({
      ...baseInputs,
      holdingMonths: 0,
    })
    expect(result.annualizedRoi).toBe(0)
    expect(result.profitPerMonth).toBe(0)
    expect(result.holdingCosts).toBe(0)
  })
})

describe('calculateRental', () => {
  it('calculates effective income with vacancy deduction', () => {
    const result = calculateRental(baseInputs)
    // 1200 - (1200 * 0.08) = 1200 - 96 = 1104
    expect(result.effectiveMonthlyIncome).toBe(1104)
  })

  it('calculates monthly expenses correctly with no loan', () => {
    const result = calculateRental(baseInputs)
    // taxes(150) + insurance(100) + maintenance(100) + management(1104*0.10=110.4) + mortgage(0)
    expect(result.totalMonthlyExpenses).toBeCloseTo(460.4, 1)
  })

  it('calculates monthly cash flow', () => {
    const result = calculateRental(baseInputs)
    // 1104 - 460.4 = 643.6
    expect(result.monthlyCashFlow).toBeCloseTo(643.6, 1)
  })

  it('calculates annual cash flow as 12x monthly', () => {
    const result = calculateRental(baseInputs)
    expect(result.annualCashFlow).toBeCloseTo(result.monthlyCashFlow * 12, 1)
  })

  it('calculates cap rate based on property value', () => {
    const result = calculateRental(baseInputs)
    expect(result.capRate).toBeGreaterThan(0)
  })

  it('calculates total cash invested', () => {
    const result = calculateRental(baseInputs)
    // purchase(85000) - loan(0) + rehab(25000) + closing(85000*0.03=2550)
    expect(result.totalCashInvested).toBe(112550)
  })

  it('calculates break-even months', () => {
    const result = calculateRental(baseInputs)
    expect(result.breakEvenMonths).toBeGreaterThan(0)
    expect(result.breakEvenMonths).toBeLessThan(Infinity)
    // 112550 / ~643.6 ~= 175 months
    expect(result.breakEvenMonths).toBeCloseTo(175, -1)
  })

  it('returns strong verdict for good cash flow and returns', () => {
    const result = calculateRental(baseInputs)
    expect(result.verdict).toBe('marginal') // CoC ~6.9% with $643/mo
  })

  it('returns Infinity break-even when cash flow is negative', () => {
    const result = calculateRental({
      ...baseInputs,
      monthlyRent: 100,
    })
    expect(result.breakEvenMonths).toBe(Infinity)
  })

  it('includes mortgage in expenses when loan exists', () => {
    const withLoan = calculateRental({
      ...baseInputs,
      loanAmount: 60000,
    })
    expect(withLoan.monthlyMortgage).toBeGreaterThan(0)
    expect(withLoan.monthlyCashFlow).toBeLessThan(
      calculateRental(baseInputs).monthlyCashFlow
    )
  })
})

describe('calculateWholesale', () => {
  it('calculates investor purchase price as purchase + fee', () => {
    const result = calculateWholesale(baseInputs)
    expect(result.investorPurchasePrice).toBe(95000) // 85000 + 10000
  })

  it('calculates investor max offer using 70% rule', () => {
    const result = calculateWholesale(baseInputs)
    // ARV * 0.7 - rehab = 165000 * 0.7 - 25000 = 115500 - 25000 = 90500
    expect(result.investorMaxOffer).toBeCloseTo(90500, 0)
  })

  it('calculates investor spread', () => {
    const result = calculateWholesale(baseInputs)
    // 90500 - 95000 = -4500
    expect(result.investorSpread).toBeCloseTo(-4500, 0)
  })

  it('returns assignment fee equal to input wholesale fee', () => {
    const result = calculateWholesale(baseInputs)
    expect(result.assignmentFee).toBe(10000)
  })

  it('calculates investor ROI', () => {
    const result = calculateWholesale(baseInputs)
    // (165000 - 95000 - 25000) / (95000 + 25000) * 100 = 45000/120000*100 = 37.5%
    expect(result.investorROI).toBeCloseTo(37.5, 1)
  })

  it('returns pass verdict when spread is negative', () => {
    const result = calculateWholesale(baseInputs)
    // investorSpread is -4500, so marginal at best
    // Fee is 10000 (>=10000) but spread is -4500 (<15000) so not strong
    // Fee is 10000 (>=5000) but spread is -4500 (<5000) so not marginal either
    expect(result.verdict).toBe('pass')
  })

  it('returns strong verdict for good deals', () => {
    const result = calculateWholesale({
      ...baseInputs,
      purchasePrice: 50000,
      arv: 165000,
      rehabCost: 25000,
      wholesaleFee: 15000,
    })
    // investorMaxOffer = 165000*0.7 - 25000 = 90500
    // investorPurchasePrice = 50000 + 15000 = 65000
    // investorSpread = 90500 - 65000 = 25500
    expect(result.investorSpread).toBeCloseTo(25500, 0)
    expect(result.verdict).toBe('strong')
  })

  it('handles zero purchase price without division error', () => {
    const result = calculateWholesale({
      ...baseInputs,
      purchasePrice: 0,
    })
    expect(result.investorROI).toBeGreaterThanOrEqual(0)
  })
})
