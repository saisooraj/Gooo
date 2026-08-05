import { compareDateKeys, formatDisplay, todayKey } from '@/utils/date'
import type { DateKey } from '@/utils/date'

/**
 * The engine's `bookingDate` is the *ideal* advance-booking deadline (e.g.
 * 60 days out), computed once at generation time. By the time it's viewed,
 * that date may already be behind "today" — showing it as-is would read as
 * a deadline in the past. Once missed, the actionable framing is "book now",
 * not a specific stale date.
 */
export function bookingLabel(bookingDate: DateKey): string {
  const today = todayKey()
  return compareDateKeys(bookingDate, today) <= 0 ? 'Book ASAP' : `Book by ${formatDisplay(bookingDate, 'DD MMM')}`
}

export function isBookingDatePast(bookingDate: DateKey): boolean {
  return compareDateKeys(bookingDate, todayKey()) <= 0
}
