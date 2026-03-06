export interface DealInputs {
  purchasePrice: number
  arv: number
  rehabCost: number
  holdingMonths: number
  monthlyTaxes: number
  monthlyInsurance: number
  monthlyUtilities: number
  closingCostPercent: number
  sellingCostPercent: number
  loanAmount: number
  interestRate: number
  monthlyRent: number
  vacancyRate: number
  monthlyMaintenance: number
  propertyManagementPercent: number
  wholesaleFee: number
}

export interface FlipAnalysis {
  totalInvestment: number
  holdingCosts: number
  closingCosts: number
  sellingCosts: number
  totalCostBasis: number
  grossProfit: number
  netProfit: number
  roi: number
  annualizedRoi: number
  profitPerMonth: number
  verdict: 'strong' | 'marginal' | 'pass'
}

export interface RentalAnalysis {
  grossMonthlyIncome: number
  effectiveMonthlyIncome: number
  totalMonthlyExpenses: number
  monthlyMortgage: number
  monthlyCashFlow: number
  annualCashFlow: number
  capRate: number
  cashOnCashReturn: number
  totalCashInvested: number
  breakEvenMonths: number
  verdict: 'strong' | 'marginal' | 'pass'
}

export interface WholesaleAnalysis {
  assignmentFee: number
  investorPurchasePrice: number
  investorMaxOffer: number
  investorSpread: number
  investorROI: number
  verdict: 'strong' | 'marginal' | 'pass'
}

export function calculateFlip(inputs: DealInputs): FlipAnalysis {
  const closingCosts = inputs.purchasePrice * (inputs.closingCostPercent / 100)
  const sellingCosts = inputs.arv * (inputs.sellingCostPercent / 100)

  const monthlyLoanPayment =
    inputs.loanAmount > 0
      ? (inputs.loanAmount *
          (inputs.interestRate / 100 / 12) *
          Math.pow(1 + inputs.interestRate / 100 / 12, 360)) /
        (Math.pow(1 + inputs.interestRate / 100 / 12, 360) - 1)
      : 0

  const monthlyHolding =
    inputs.monthlyTaxes +
    inputs.monthlyInsurance +
    inputs.monthlyUtilities +
    monthlyLoanPayment

  const holdingCosts = monthlyHolding * inputs.holdingMonths
  const totalInvestment = inputs.purchasePrice + inputs.rehabCost
  const totalCostBasis = totalInvestment + closingCosts + sellingCosts + holdingCosts
  const grossProfit = inputs.arv - inputs.purchasePrice - inputs.rehabCost
  const netProfit = inputs.arv - totalCostBasis
  const cashInvested = totalInvestment - inputs.loanAmount + closingCosts
  const roi = cashInvested > 0 ? (netProfit / cashInvested) * 100 : 0
  const annualizedRoi =
    inputs.holdingMonths > 0 ? roi * (12 / inputs.holdingMonths) : 0
  const profitPerMonth =
    inputs.holdingMonths > 0 ? netProfit / inputs.holdingMonths : 0

  let verdict: 'strong' | 'marginal' | 'pass'
  if (roi >= 25 && netProfit >= 20000) verdict = 'strong'
  else if (roi >= 10 && netProfit >= 5000) verdict = 'marginal'
  else verdict = 'pass'

  return {
    totalInvestment,
    holdingCosts,
    closingCosts,
    sellingCosts,
    totalCostBasis,
    grossProfit,
    netProfit,
    roi,
    annualizedRoi,
    profitPerMonth,
    verdict,
  }
}

export function calculateRental(inputs: DealInputs): RentalAnalysis {
  const grossMonthlyIncome = inputs.monthlyRent
  const vacancyLoss = grossMonthlyIncome * (inputs.vacancyRate / 100)
  const effectiveMonthlyIncome = grossMonthlyIncome - vacancyLoss

  const monthlyMortgage =
    inputs.loanAmount > 0
      ? (inputs.loanAmount *
          (inputs.interestRate / 100 / 12) *
          Math.pow(1 + inputs.interestRate / 100 / 12, 360)) /
        (Math.pow(1 + inputs.interestRate / 100 / 12, 360) - 1)
      : 0

  const propertyManagement =
    effectiveMonthlyIncome * (inputs.propertyManagementPercent / 100)

  const totalMonthlyExpenses =
    inputs.monthlyTaxes +
    inputs.monthlyInsurance +
    inputs.monthlyMaintenance +
    propertyManagement +
    monthlyMortgage

  const monthlyCashFlow = effectiveMonthlyIncome - totalMonthlyExpenses
  const annualCashFlow = monthlyCashFlow * 12

  const totalPropertyValue = inputs.purchasePrice + inputs.rehabCost
  const noi =
    (effectiveMonthlyIncome - totalMonthlyExpenses + monthlyMortgage) * 12
  const capRate = totalPropertyValue > 0 ? (noi / totalPropertyValue) * 100 : 0

  const closingCosts = inputs.purchasePrice * (inputs.closingCostPercent / 100)
  const totalCashInvested =
    inputs.purchasePrice - inputs.loanAmount + inputs.rehabCost + closingCosts
  const cashOnCashReturn =
    totalCashInvested > 0 ? (annualCashFlow / totalCashInvested) * 100 : 0

  const breakEvenMonths =
    monthlyCashFlow > 0 ? Math.ceil(totalCashInvested / monthlyCashFlow) : Infinity

  let verdict: 'strong' | 'marginal' | 'pass'
  if (cashOnCashReturn >= 12 && monthlyCashFlow >= 200) verdict = 'strong'
  else if (cashOnCashReturn >= 6 && monthlyCashFlow >= 50) verdict = 'marginal'
  else verdict = 'pass'

  return {
    grossMonthlyIncome,
    effectiveMonthlyIncome,
    totalMonthlyExpenses,
    monthlyMortgage,
    monthlyCashFlow,
    annualCashFlow,
    capRate,
    cashOnCashReturn,
    totalCashInvested,
    breakEvenMonths,
    verdict,
  }
}

export function calculateWholesale(inputs: DealInputs): WholesaleAnalysis {
  const investorPurchasePrice = inputs.purchasePrice + inputs.wholesaleFee
  const investorMaxOffer = inputs.arv * 0.7 - inputs.rehabCost
  const investorSpread = investorMaxOffer - investorPurchasePrice
  const investorROI =
    investorPurchasePrice > 0
      ? ((inputs.arv - investorPurchasePrice - inputs.rehabCost) /
          (investorPurchasePrice + inputs.rehabCost)) *
        100
      : 0

  let verdict: 'strong' | 'marginal' | 'pass'
  if (inputs.wholesaleFee >= 10000 && investorSpread >= 15000) verdict = 'strong'
  else if (inputs.wholesaleFee >= 5000 && investorSpread >= 5000) verdict = 'marginal'
  else verdict = 'pass'

  return {
    assignmentFee: inputs.wholesaleFee,
    investorPurchasePrice,
    investorMaxOffer,
    investorSpread,
    investorROI,
    verdict,
  }
}
