import type { DateKey } from '@/utils/date'
import { getMonth, getYear, isAfter } from '@/utils/date'

export interface LeaveAccrualInput {
  openingBalance: number
  monthlyCredit: number
  /** Number of months of credit that have accrued so far (0–12). */
  monthsElapsed: number
  leaveUsed: number
  carryForward: number
}

/** Total leave accrued to date, before subtracting what's been used. */
export function computeAccruedBalance(input: LeaveAccrualInput): number {
  const monthsElapsed = Math.max(0, Math.min(12, input.monthsElapsed))
  return input.openingBalance + input.monthlyCredit * monthsElapsed + input.carryForward
}

/** Leave still available to spend: accrued balance minus leave already used. */
export function computeRemainingBalance(input: LeaveAccrualInput): number {
  return computeAccruedBalance(input) - input.leaveUsed
}

/** How many whole months of `year` have started as of `asOf` (0–12). */
export function monthsElapsedInYear(year: number, asOf: DateKey): number {
  if (getYear(asOf) > year) return 12
  if (getYear(asOf) < year) return 0
  return getMonth(asOf)
}

/** Carry-forward is capped by the leave type's configured limit, never negative. */
export function computeCarryForwardToNextYear(
  remainingBalance: number,
  carryForwardLimit: number,
): number {
  return Math.max(0, Math.min(remainingBalance, carryForwardLimit))
}

export function isLeaveExpired(expiryDate: DateKey | null, asOf: DateKey): boolean {
  if (!expiryDate) return false
  return isAfter(asOf, expiryDate)
}

export { computeEfficiency, type EfficiencyResult } from '@/modules/shared/lib/efficiency'
