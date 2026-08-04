import type { DateKey, WeekdayIndex } from '@/utils/date'
import { diffDays, isAfter, isSameOrAfterKey, subtractDays, todayKey } from '@/utils/date'
import { BOOKING_REMINDER_LEAD_DAYS } from '@/constants/transport'
import type { BookingDemand, BookingWindow } from '../types/transport.types'

/**
 * Booking opens `advanceReservationDays` before the journey date and stays
 * open until the journey date itself. Pure function of its inputs — no
 * external state — so it's trivially testable and identical for every user.
 */
export function computeBookingWindow(
  journeyDate: DateKey,
  advanceReservationDays: number,
  asOf: DateKey = todayKey(),
): BookingWindow {
  const bookingOpensOn = subtractDays(journeyDate, advanceReservationDays)
  const bookingClosesOn = journeyDate
  const daysUntilOpen = diffDays(asOf, bookingOpensOn)

  let status: BookingWindow['status']
  if (isAfter(asOf, bookingClosesOn)) status = 'closed'
  else if (isSameOrAfterKey(asOf, bookingOpensOn)) {
    status = daysUntilOpen === 0 ? 'open-book-today' : 'open'
  } else status = 'upcoming'

  return { bookingOpensOn, bookingClosesOn, daysUntilOpen, status }
}

/** Automatically derives the return leg's booking window from the outbound one. */
export function computeReturnBookingDate(
  returnJourneyDate: DateKey,
  advanceReservationDays: number,
): DateKey {
  return subtractDays(returnJourneyDate, advanceReservationDays)
}

export type BookingReminderLevel =
  | 'booked'
  | 'book-today'
  | 'book-tomorrow'
  | 'book-this-week'
  | 'upcoming'
  | 'already-missed'

/** Drives the dashboard's "Book Today / Book Tomorrow / This Week / Missed" widget. */
export function getBookingReminder(
  window: BookingWindow,
  bookedDate: DateKey | null,
): BookingReminderLevel {
  if (bookedDate) return 'booked'
  if (window.status === 'closed') return 'already-missed'
  if (window.status === 'open-book-today' || window.status === 'open') return 'book-today'
  if (window.daysUntilOpen === 1) return 'book-tomorrow'
  if (window.daysUntilOpen <= 7) return 'book-this-week'
  return 'upcoming'
}

export function isReminderDue(window: BookingWindow): boolean {
  return window.daysUntilOpen >= 0 && window.daysUntilOpen <= BOOKING_REMINDER_LEAD_DAYS
}

export interface DemandInput {
  journeyWeekday: WeekdayIndex
  isLongWeekend: boolean
  isFestivalPeriod?: boolean
}

/**
 * Deterministic placeholder heuristic for ticket demand — real-world demand
 * depends on data this app doesn't have yet (regional festival calendars,
 * historical booking velocity). Intentionally simple and easy to replace.
 */
export function estimateDemand(input: DemandInput): BookingDemand {
  if (input.isFestivalPeriod) return 'Very High'
  if (input.isLongWeekend) return 'High'
  if (input.journeyWeekday === 5 || input.journeyWeekday === 0) return 'Medium'
  return 'Low'
}
