import { describe, expect, it } from 'vitest'
import {
  computeAccruedBalance,
  computeCarryForwardToNextYear,
  computeEfficiency,
  computeRemainingBalance,
  isLeaveExpired,
  monthsElapsedInYear,
} from './leaveCalculations'

describe('leave accrual', () => {
  it('accrues monthly credit up to the elapsed months', () => {
    expect(
      computeAccruedBalance({
        openingBalance: 5,
        monthlyCredit: 1.5,
        monthsElapsed: 6,
        leaveUsed: 0,
        carryForward: 2,
      }),
    ).toBe(5 + 1.5 * 6 + 2)
  })

  it('clamps monthsElapsed into 0-12', () => {
    expect(
      computeAccruedBalance({
        openingBalance: 0,
        monthlyCredit: 1,
        monthsElapsed: 20,
        leaveUsed: 0,
        carryForward: 0,
      }),
    ).toBe(12)
  })

  it('subtracts leave used to get remaining balance', () => {
    expect(
      computeRemainingBalance({
        openingBalance: 12,
        monthlyCredit: 0,
        monthsElapsed: 0,
        leaveUsed: 5,
        carryForward: 0,
      }),
    ).toBe(7)
  })
})

describe('monthsElapsedInYear', () => {
  it('returns 12 for a past year', () => {
    expect(monthsElapsedInYear(2020, '2026-07-29')).toBe(12)
  })

  it('returns 0 for a future year', () => {
    expect(monthsElapsedInYear(2030, '2026-07-29')).toBe(0)
  })

  it('returns the current month number for the current year', () => {
    expect(monthsElapsedInYear(2026, '2026-07-29')).toBe(7)
  })
})

describe('carry forward', () => {
  it('caps carry forward at the configured limit', () => {
    expect(computeCarryForwardToNextYear(10, 5)).toBe(5)
  })

  it('never goes negative', () => {
    expect(computeCarryForwardToNextYear(-3, 5)).toBe(0)
  })
})

describe('leave expiry', () => {
  it('is expired once the expiry date has passed', () => {
    expect(isLeaveExpired('2026-01-01', '2026-07-29')).toBe(true)
  })

  it('is not expired when there is no expiry date', () => {
    expect(isLeaveExpired(null, '2026-07-29')).toBe(false)
  })
})

describe('vacation efficiency scoring', () => {
  it.each([
    [4, 1, 4.0, 5],
    [5, 2, 2.5, 4],
    [9, 4, 2.25, 3],
  ])('%i vacation days on %i leave -> efficiency %f, %i stars', (days, leave, eff, stars) => {
    const result = computeEfficiency(days, leave)
    expect(result.efficiency).toBeCloseTo(eff)
    expect(result.stars).toBe(stars)
  })
})
