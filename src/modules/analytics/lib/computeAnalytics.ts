import { todayKey } from '@/utils/date'
import type { DateKey, WeekendConfig } from '@/utils/date'
import type { LeaveBalance } from '@/modules/leaves/types/leave.types'
import type { Trip } from '@/modules/trips/types/trip.types'
import type { TripBooking } from '@/modules/transport/types/transport.types'
import { computeAccruedBalance, monthsElapsedInYear } from '@/modules/leaves/lib/leaveCalculations'
import { computeEfficiency, type EfficiencyResult } from '@/modules/shared/lib/efficiency'
import { classifyDateRange } from '@/modules/shared/lib/dayBreakdown'
import { computeBookingWindow, getBookingReminder } from '@/modules/transport/lib/bookingWindow'
import { DEFAULT_ADVANCE_RESERVATION_DAYS } from '@/constants/transport'

export interface AnalyticsSummary {
  /** What you have banked *today*: accrued-to-date minus leave already consumed. */
  currentBalance: number
  /** What you'll have by year-end if every scheduled monthly credit lands, minus consumed leave. */
  projectedYearEndBalance: number
  /** Leave already recorded as used (the leave ledger's `leaveUsed` field) — a historical fact, never a future trip. */
  consumedLeave: number
  /** Leave-days actually required by trips that are Planning/Booked but not yet taken — held, not spent. */
  reservedLeave: number
  /** Projected year-end balance minus reserved leave — what's truly free to commit to new plans. */
  availableAfterReservations: number

  vacationDays: number
  weekendDaysUtilized: number
  holidayDaysUtilized: number
  vacationEfficiency: number
  vacationStars: EfficiencyResult['stars']

  totalTrips: number
  completedTrips: number
  plannedTrips: number
  averageTripDurationDays: number

  /** Bookings whose window is open-and-unbooked, opening within a week, or already missed. */
  upcomingBookingsCount: number
}

const ACTIONABLE_REMINDERS = new Set(['book-today', 'book-tomorrow', 'book-this-week', 'already-missed'])

/**
 * Pure aggregation over a single year's leave balances, trips, and bookings.
 *
 * Accrual-based leave only becomes available as each month elapses — it is
 * never fair to treat the full year's worth of monthly credit as "available
 * today" (that's what "projected" is for). Likewise, a Planning/Booked trip
 * reserves leave for a future date; it has not been consumed yet, so it must
 * never be added to `consumedLeave`. Only the leave ledger's own `leaveUsed`
 * field — which the user maintains directly — counts as consumed.
 */
export function computeAnalytics(
  year: number,
  leaveBalances: LeaveBalance[],
  trips: Trip[],
  holidayDates: ReadonlySet<DateKey>,
  weekend: WeekendConfig,
  bookings: TripBooking[] = [],
  asOf: DateKey = todayKey(),
): AnalyticsSummary {
  const yearBalances = leaveBalances.filter((balance) => balance.year === year)

  const consumedLeave = yearBalances.reduce((sum, balance) => sum + balance.leaveUsed, 0)

  const currentAccrued = yearBalances.reduce(
    (sum, balance) =>
      sum +
      computeAccruedBalance({
        openingBalance: balance.openingBalance,
        monthlyCredit: balance.monthlyCredit,
        monthsElapsed: monthsElapsedInYear(balance.year, asOf),
        leaveUsed: 0,
        carryForward: balance.carryForward,
      }),
    0,
  )
  const projectedAccrued = yearBalances.reduce(
    (sum, balance) =>
      sum +
      computeAccruedBalance({
        openingBalance: balance.openingBalance,
        monthlyCredit: balance.monthlyCredit,
        monthsElapsed: 12,
        leaveUsed: 0,
        carryForward: balance.carryForward,
      }),
    0,
  )

  const currentBalance = currentAccrued - consumedLeave
  const projectedYearEndBalance = projectedAccrued - consumedLeave

  const yearTrips = trips.filter(
    (trip) => trip.departureDate.startsWith(String(year)) && trip.status !== 'Cancelled',
  )

  let vacationDays = 0
  let weekendDaysUtilized = 0
  let holidayDaysUtilized = 0
  let totalLeaveCost = 0
  let reservedLeave = 0

  for (const trip of yearTrips) {
    const breakdown = classifyDateRange(trip.departureDate, trip.returnDate, holidayDates, weekend)
    vacationDays += breakdown.totalDays
    weekendDaysUtilized += breakdown.weekendDays
    holidayDaysUtilized += breakdown.holidayDays
    totalLeaveCost += breakdown.workdays

    // Only future, not-yet-taken trips reserve leave — completed trips have
    // already had their leave accounted for via the ledger's `leaveUsed`.
    if (trip.status === 'Planning' || trip.status === 'Booked') {
      reservedLeave += breakdown.workdays
    }
  }

  const availableAfterReservations = projectedYearEndBalance - reservedLeave

  const completedTrips = yearTrips.filter((trip) => trip.status === 'Completed').length
  const plannedTrips = yearTrips.filter(
    (trip) => trip.status === 'Planning' || trip.status === 'Booked',
  ).length
  const averageTripDurationDays = yearTrips.length > 0 ? vacationDays / yearTrips.length : 0

  const { efficiency: vacationEfficiency, stars: vacationStars } = computeEfficiency(
    vacationDays,
    totalLeaveCost,
  )

  const upcomingBookingsCount = bookings.filter((booking) => {
    const advanceDays = booking.train?.advanceReservationDays ?? DEFAULT_ADVANCE_RESERVATION_DAYS
    const window = computeBookingWindow(booking.journeyDate, advanceDays, asOf)
    return ACTIONABLE_REMINDERS.has(getBookingReminder(window, booking.bookedDate))
  }).length

  return {
    currentBalance,
    projectedYearEndBalance,
    consumedLeave,
    reservedLeave,
    availableAfterReservations,
    vacationDays,
    weekendDaysUtilized,
    holidayDaysUtilized,
    vacationEfficiency,
    vacationStars,
    totalTrips: yearTrips.length,
    completedTrips,
    plannedTrips,
    averageTripDurationDays,
    upcomingBookingsCount,
  }
}
