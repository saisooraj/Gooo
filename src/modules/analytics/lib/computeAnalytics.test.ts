import { describe, expect, it } from 'vitest'
import { WEEKEND_PRESETS } from '@/utils/date'
import { computeAnalytics } from './computeAnalytics'
import type { LeaveBalance } from '@/modules/leaves/types/leave.types'
import type { Trip } from '@/modules/trips/types/trip.types'
import type { TripBooking } from '@/modules/transport/types/transport.types'

function leaveBalance(overrides: Partial<LeaveBalance> = {}): LeaveBalance {
  return {
    id: '1',
    userId: 'u1',
    createdAt: '',
    updatedAt: '',
    year: 2026,
    leaveType: 'Earned Leave',
    openingBalance: 12,
    monthlyCredit: 1,
    leaveUsed: 2,
    carryForward: 0,
    carryForwardLimit: 10,
    expiryDate: null,
    ...overrides,
  }
}

function trip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: '1',
    userId: 'u1',
    createdAt: '',
    updatedAt: '',
    title: 'Trip',
    origin: 'A',
    destination: 'B',
    departureDate: '2026-01-05', // Monday
    returnDate: '2026-01-07', // Wednesday — 3 workdays, 0 weekend/holiday
    mode: 'Train',
    status: 'Completed',
    ...overrides,
  }
}

describe('accrual-based balance math', () => {
  it('current balance only counts months elapsed so far, not the full year', () => {
    // 6 months elapsed as of the asOf date: opening 12 + 1*6 = 18, minus 2 consumed = 16
    const summary = computeAnalytics(
      2026,
      [leaveBalance({ leaveUsed: 2 })],
      [],
      new Set(),
      WEEKEND_PRESETS.SAT_SUN,
      [],
      '2026-06-15',
    )
    expect(summary.currentBalance).toBe(16)
  })

  it('projected year-end balance assumes all 12 months of credit land', () => {
    // opening 12 + 1*12 = 24, minus 2 consumed = 22 — regardless of how much of the year has passed
    const summary = computeAnalytics(
      2026,
      [leaveBalance({ leaveUsed: 2 })],
      [],
      new Set(),
      WEEKEND_PRESETS.SAT_SUN,
      [],
      '2026-02-01',
    )
    expect(summary.projectedYearEndBalance).toBe(22)
  })

  it('never treats future monthly credit as currently available', () => {
    const summary = computeAnalytics(
      2026,
      [leaveBalance({ openingBalance: 0, monthlyCredit: 2, leaveUsed: 0 })],
      [],
      new Set(),
      WEEKEND_PRESETS.SAT_SUN,
      [],
      '2026-01-01', // effectively 1 month elapsed
    )
    expect(summary.currentBalance).toBeLessThan(summary.projectedYearEndBalance)
  })

  it('consumed leave comes only from the leave ledger, not from trips', () => {
    const summary = computeAnalytics(
      2026,
      [leaveBalance({ leaveUsed: 5 })],
      [trip({ status: 'Completed' })],
      new Set(),
      WEEKEND_PRESETS.SAT_SUN,
    )
    expect(summary.consumedLeave).toBe(5)
  })
})

describe('reserved vs. consumed leave', () => {
  it('does not count planned trips as consumed leave', () => {
    const summary = computeAnalytics(
      2026,
      [leaveBalance({ leaveUsed: 0 })],
      [trip({ status: 'Planning' })],
      new Set(),
      WEEKEND_PRESETS.SAT_SUN,
    )
    expect(summary.consumedLeave).toBe(0)
    expect(summary.reservedLeave).toBe(3)
  })

  it('does not reserve leave for already-completed trips', () => {
    const summary = computeAnalytics(
      2026,
      [leaveBalance({ leaveUsed: 0 })],
      [trip({ status: 'Completed' })],
      new Set(),
      WEEKEND_PRESETS.SAT_SUN,
    )
    expect(summary.reservedLeave).toBe(0)
  })

  it('reserves leave for Booked trips too, not just Planning', () => {
    const summary = computeAnalytics(
      2026,
      [],
      [trip({ status: 'Booked' })],
      new Set(),
      WEEKEND_PRESETS.SAT_SUN,
    )
    expect(summary.reservedLeave).toBe(3)
  })

  it('only counts workdays within a trip as reserved leave, not weekend/holiday days', () => {
    // Thu holiday, Fri workday, Sat/Sun weekend -> 1 workday reserved out of 4 trip days
    const summary = computeAnalytics(
      2026,
      [],
      [trip({ status: 'Planning', departureDate: '2026-01-01', returnDate: '2026-01-04' })],
      new Set(['2026-01-01']),
      WEEKEND_PRESETS.SAT_SUN,
    )
    expect(summary.reservedLeave).toBe(1)
    expect(summary.vacationDays).toBe(4)
  })

  it('excludes explicitly-marked leave dates from reserved leave (e.g. an evening travel day)', () => {
    const summary = computeAnalytics(
      2026,
      [],
      [trip({ status: 'Planning', excludedLeaveDates: ['2026-01-05'] })], // Mon excluded, Tue+Wed remain
      new Set(),
      WEEKEND_PRESETS.SAT_SUN,
    )
    expect(summary.reservedLeave).toBe(2)
    expect(summary.vacationDays).toBe(3)
  })

  it('computes available-after-reservations as projected balance minus reserved leave', () => {
    const summary = computeAnalytics(
      2026,
      [leaveBalance({ openingBalance: 10, monthlyCredit: 0, leaveUsed: 0 })],
      [trip({ status: 'Planning' })], // reserves 3
      new Set(),
      WEEKEND_PRESETS.SAT_SUN,
    )
    expect(summary.projectedYearEndBalance).toBe(10)
    expect(summary.reservedLeave).toBe(3)
    expect(summary.availableAfterReservations).toBe(7)
  })
})

describe('trip stats', () => {
  it('excludes cancelled trips and other years from trip stats', () => {
    const summary = computeAnalytics(
      2026,
      [],
      [
        trip({ status: 'Completed' }),
        trip({ id: '2', status: 'Cancelled' }),
        trip({ id: '3', departureDate: '2025-06-01', returnDate: '2025-06-03' }),
      ],
      new Set(),
      WEEKEND_PRESETS.SAT_SUN,
    )
    expect(summary.totalTrips).toBe(1)
    expect(summary.completedTrips).toBe(1)
  })

  it('classifies vacation days into holiday/weekend buckets', () => {
    // 2026-01-01 Thu (holiday), 01-02 Fri, 01-03 Sat (weekend), 01-04 Sun (weekend)
    const summary = computeAnalytics(
      2026,
      [],
      [trip({ departureDate: '2026-01-01', returnDate: '2026-01-04' })],
      new Set(['2026-01-01']),
      WEEKEND_PRESETS.SAT_SUN,
    )
    expect(summary.vacationDays).toBe(4)
    expect(summary.holidayDaysUtilized).toBe(1)
    expect(summary.weekendDaysUtilized).toBe(2)
  })

  it('computes average trip duration across all counted trips', () => {
    const summary = computeAnalytics(
      2026,
      [],
      [
        trip({ departureDate: '2026-01-01', returnDate: '2026-01-04' }), // 4 days
        trip({ id: '2', departureDate: '2026-02-01', returnDate: '2026-02-02' }), // 2 days
      ],
      new Set(),
      WEEKEND_PRESETS.SAT_SUN,
    )
    expect(summary.averageTripDurationDays).toBe(3)
  })

  it('scores vacation efficiency from trip day-cost, independent of the leave ledger', () => {
    // 4 vacation days for 1 actual leave day (holiday-adjacent trip) -> 4.0 efficiency
    const summary = computeAnalytics(
      2026,
      [leaveBalance({ leaveUsed: 99 })], // ledger value must not affect trip efficiency
      [trip({ status: 'Planning', departureDate: '2026-01-01', returnDate: '2026-01-04' })],
      new Set(['2026-01-01']),
      WEEKEND_PRESETS.SAT_SUN,
    )
    expect(summary.vacationEfficiency).toBeCloseTo(4)
    expect(summary.vacationStars).toBe(5)
  })
})

describe('upcoming bookings', () => {
  function booking(overrides: Partial<TripBooking> = {}): TripBooking {
    return {
      id: 'b1',
      userId: 'u1',
      createdAt: '',
      updatedAt: '',
      tripId: '1',
      mode: 'Train',
      journeyDate: '2026-12-25',
      bookedDate: null,
      train: {
        trainNumber: '12345',
        trainName: 'Express',
        boardingStation: 'A',
        destinationStation: 'B',
        quota: 'General',
        advanceReservationDays: 120,
        priority: 3,
        demand: 'Medium',
      },
      ...overrides,
    }
  }

  it('counts a booking whose window is open as an upcoming action', () => {
    const summary = computeAnalytics(
      2026,
      [],
      [],
      new Set(),
      WEEKEND_PRESETS.SAT_SUN,
      [booking()],
      '2026-12-01', // well after the 120-day-out opening date
    )
    expect(summary.upcomingBookingsCount).toBe(1)
  })

  it('does not count a booking that is already booked', () => {
    const summary = computeAnalytics(
      2026,
      [],
      [],
      new Set(),
      WEEKEND_PRESETS.SAT_SUN,
      [booking({ bookedDate: '2026-08-01' })],
      '2026-12-01',
    )
    expect(summary.upcomingBookingsCount).toBe(0)
  })

  it('does not count a booking whose window is still far in the future', () => {
    const summary = computeAnalytics(
      2026,
      [],
      [],
      new Set(),
      WEEKEND_PRESETS.SAT_SUN,
      [booking()],
      '2026-01-01',
    )
    expect(summary.upcomingBookingsCount).toBe(0)
  })
})
