import { PRIME_RATE, bandFor, type UserProfile } from './data'

export function calculateInstallment(principal: number, annualRatePct: number, termMonths: number) {
  const monthlyRate = annualRatePct / 100 / 12
  if (monthlyRate === 0) return principal / termMonths
  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths))
}

function yearsSince(dateStr: string | null): number | null {
  if (!dateStr) return null
  const then = new Date(dateStr)
  if (isNaN(then.getTime())) return null
  const now = new Date()
  let years = now.getFullYear() - then.getFullYear()
  const monthDiff = now.getMonth() - then.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < then.getDate())) years--
  return Math.max(0, years)
}

export function getAge(dateOfBirth: string | null): number | null {
  return yearsSince(dateOfBirth)
}

export function getLicenseYears(licenseIssuedDate: string | null): number | null {
  return yearsSince(licenseIssuedDate)
}

// Estimated rate = Prime + credit-band premium + a small risk loading for
// younger / newly-licensed drivers, similar to how real lenders price risk.
// This is an illustrative estimate, not a loan offer or pre-approval.
export function estimateRate(user: UserProfile): number {
  const band = bandFor(user.creditScore)
  const creditPremium = band.min >= 700 ? 0.5 : band.min >= 650 ? 1 : band.min >= 600 ? 2.5 : band.min >= 550 ? 4 : 6

  const age = getAge(user.dateOfBirth)
  let ageLoading = 0
  if (age !== null) {
    if (age < 21) ageLoading = 1.5
    else if (age < 25) ageLoading = 1.0
    else if (age < 30) ageLoading = 0.5
  }

  const licenseYears = getLicenseYears(user.licenseIssuedDate)
  let licenseLoading = 0
  if (licenseYears !== null) {
    if (licenseYears < 1) licenseLoading = 1.0
    else if (licenseYears < 2) licenseLoading = 0.5
  }

  return PRIME_RATE + creditPremium + ageLoading + licenseLoading
}

const DEFAULT_DEPOSIT_PCT = 10
const DEFAULT_TERM_MONTHS = 72

export function estimateMonthlyInstallment(price: number, user: UserProfile) {
  const deposit = (price * DEFAULT_DEPOSIT_PCT) / 100
  const principal = price - deposit
  const rate = estimateRate(user)
  const installment = calculateInstallment(principal, rate, DEFAULT_TERM_MONTHS)
  return { installment, rate, deposit, termMonths: DEFAULT_TERM_MONTHS, depositPct: DEFAULT_DEPOSIT_PCT }
}
