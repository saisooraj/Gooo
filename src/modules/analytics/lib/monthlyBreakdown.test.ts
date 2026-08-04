import { describe, expect, it } from 'vitest'
import { computeMonthlyVacationDays } from './monthlyBreakdown'
import type { Trip } from '@/modules/trips/types/trip.types'

function trip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: 't1',
    userId: 'u1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    title: 'Trip',
    origin: 'Delhi',
    destination: 'Jaipur',
    departureDate: '2026-10-01',
    returnDate: '2026-10-04',
    mode: 'Train',
    status: 'Booked',
    ...overrides,
  }
}

describe('computeMonthlyVacationDays', () => {
  it('returns 12 zeroed months when there are no trips', () => {
    const result = computeMonthlyVacationDays(2026, [])
    expect(result).toHaveLength(12)
    expect(result.every((m) => m.days === 0)).toBe(true)
  })

  it('counts every day of a trip within the target year', () => {
    const result = computeMonthlyVacationDays(2026, [trip()])
    expect(result[9]?.days).toBe(4) // October
  })

  it('splits a trip that spans two months across both', () => {
    const result = computeMonthlyVacationDays(2026, [trip({ departureDate: '2026-10-30', returnDate: '2026-11-02' })])
    expect(result[9]?.days).toBe(2) // Oct 30-31
    expect(result[10]?.days).toBe(2) // Nov 1-2
  })

  it('ignores cancelled trips', () => {
    const result = computeMonthlyVacationDays(2026, [trip({ status: 'Cancelled' })])
    expect(result.every((m) => m.days === 0)).toBe(true)
  })

  it('ignores days outside the target year', () => {
    const result = computeMonthlyVacationDays(2027, [trip()])
    expect(result.every((m) => m.days === 0)).toBe(true)
  })
})
