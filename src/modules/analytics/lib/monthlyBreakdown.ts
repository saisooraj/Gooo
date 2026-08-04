import { eachDateInRange, getMonth, getYear } from '@/utils/date'
import type { Trip } from '@/modules/trips/types/trip.types'

export interface MonthlyVacationDays {
  month: number
  days: number
}

/** Vacation days (any day of a non-cancelled trip) per calendar month of `year`. */
export function computeMonthlyVacationDays(year: number, trips: Trip[]): MonthlyVacationDays[] {
  const totals: MonthlyVacationDays[] = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, days: 0 }))

  for (const trip of trips) {
    if (trip.status === 'Cancelled') continue
    for (const date of eachDateInRange(trip.departureDate, trip.returnDate)) {
      if (getYear(date) !== year) continue
      const entry = totals[getMonth(date) - 1]
      if (entry) entry.days += 1
    }
  }

  return totals
}
