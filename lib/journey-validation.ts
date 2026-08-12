import type { UserProfile } from './data'
import type { Expense } from './db'

export type ValidationResult = {
  complete: boolean
  missing: string[]
}

// Real validation for the "Know Yourself" journey stage — every item here
// must actually be present before the stage is allowed to show as
// completed. No button just flips a status flag.
export function validateKnowYourself(user: UserProfile, expenses: Expense[]): ValidationResult {
  const missing: string[] = []

  if (!user.monthlyIncome || user.monthlyIncome <= 0) {
    missing.push('Net monthly income')
  }
  if (!user.employmentStatus) {
    missing.push('Employment status')
  }
  if (!user.buyingGoal) {
    missing.push('Buying goal')
  }
  if (!user.dateOfBirth) {
    missing.push('Date of birth')
  }
  if (!user.licenseIssuedDate) {
    missing.push('License issued date')
  }
  if (expenses.length === 0) {
    missing.push('At least one monthly expense entry (add R0 if you truly have none)')
  }

  return { complete: missing.length === 0, missing }
}

export function validateKnowRights(user: UserProfile): ValidationResult {
  return {
    complete: user.rightsAcknowledged,
    missing: user.rightsAcknowledged ? [] : ['Acknowledge that you have read your rights'],
  }
}
