import type { UserProfile } from './data'
import { bandFor } from './data'
import { getAge, getLicenseYears } from './finance-estimate'

// Builds a compact plain-text summary of real user data to ground the AI's
// answers in this user's actual numbers, without sending the full profile row.
export function buildProfileContext(user: UserProfile, totalExpenses: number): string {
  const band = bandFor(user.creditScore)
  const age = getAge(user.dateOfBirth)
  const licenseYears = getLicenseYears(user.licenseIssuedDate)
  const lines = [
    `Employment status: ${user.employmentStatus}`,
    `Net monthly income: R${user.monthlyIncome}`,
    `Total monthly expenses: R${totalExpenses}`,
    `Credit score: ${user.creditScore} (${band.label})`,
    `Estimated buying power: R${user.buyingPower}`,
    `Province: ${user.province}`,
    age !== null ? `Age: ${age}` : null,
    licenseYears !== null ? `Years licensed: ${licenseYears}` : null,
    `Buying goal: ${user.buyingGoal}`,
    `Has acknowledged their consumer rights: ${user.rightsAcknowledged ? 'yes' : 'no'}`,
  ]
  return lines.filter(Boolean).join('\n')
}
