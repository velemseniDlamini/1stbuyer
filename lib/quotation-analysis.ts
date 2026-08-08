import { PRIME_RATE, bandFor, type QuotationFee } from './data'
import { formatRand } from './format'

export type QuotationInput = {
  vehicle: string
  vehiclePrice: number
  deposit: number
  termMonths: number
  interestRate: number
  adminFee: number
  creditLifeFee: number
  trackingFee: number
  balloonPct: number
}

const INITIATION_FEE = 1207
const ADMIN_BENCHMARK = 3500

export function analyzeQuotation(input: QuotationInput, creditScore: number) {
  const band = bandFor(creditScore)
  const creditLifeBenchmark = Math.round(input.vehiclePrice * 0.0108)
  const entitledPremium = band.min >= 700 ? 0.5 : band.min >= 650 ? 1 : band.min >= 600 ? 2.5 : 4
  const entitledRate = PRIME_RATE + entitledPremium

  const fees: QuotationFee[] = [
    { label: 'Vehicle price', amount: input.vehiclePrice, benchmark: input.vehiclePrice, flag: 'ok' },
    { label: 'Initiation fee', amount: INITIATION_FEE, benchmark: INITIATION_FEE, flag: 'ok' },
    {
      label: 'Admin fee',
      amount: input.adminFee,
      benchmark: ADMIN_BENCHMARK,
      flag: input.adminFee > ADMIN_BENCHMARK ? 'high' : 'ok',
    },
    {
      label: 'Credit life insurance',
      amount: input.creditLifeFee,
      benchmark: creditLifeBenchmark,
      flag: input.creditLifeFee > creditLifeBenchmark ? 'high' : 'ok',
    },
    { label: 'Tracking device', amount: input.trackingFee, benchmark: input.trackingFee, flag: 'ok' },
  ]

  const redFlags: string[] = []

  if (input.interestRate > entitledRate + 0.05) {
    redFlags.push(
      `Interest rate of ${input.interestRate.toFixed(2)}% is Prime +${(input.interestRate - PRIME_RATE).toFixed(2)}%. With your score of ${creditScore} you should qualify for around Prime +${entitledPremium.toFixed(2)}% — negotiate down.`,
    )
  }
  if (input.adminFee > ADMIN_BENCHMARK) {
    redFlags.push(
      `Admin fee of ${formatRand(input.adminFee)} is ${formatRand(input.adminFee - ADMIN_BENCHMARK)} above the industry standard of ${formatRand(ADMIN_BENCHMARK)}.`,
    )
  }
  if (input.creditLifeFee > creditLifeBenchmark * 1.2) {
    redFlags.push(
      `Credit life insurance of ${formatRand(input.creditLifeFee)} looks marked up vs. a typical ${formatRand(creditLifeBenchmark)}. You may source your own cover (NCA Section 106).`,
    )
  }
  if (input.balloonPct > 25) {
    const owing = Math.round((input.vehiclePrice * input.balloonPct) / 100)
    redFlags.push(
      `A ${input.balloonPct}% balloon leaves ~${formatRand(owing)} owing at the end of the term. Ask for a quote without a balloon.`,
    )
  }
  if (redFlags.length === 0) {
    redFlags.push('No major red flags detected — this quotation looks broadly in line with market norms.')
  }

  return { fees, redFlags }
}
