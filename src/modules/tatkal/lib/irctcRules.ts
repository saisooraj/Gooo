import type { TatkalClass } from '../types/tatkal.types'

/**
 * IRCTC-specific reservation constants. This is the ONE file a future
 * non-IRCTC reservation system would swap out — everything else in the module
 * is provider-agnostic and reads from here.
 */

/** AC Tatkal opens at 10:00 IST, Non-AC at 11:00 IST. */
export const TATKAL_OPEN_TIME: Record<TatkalClass, string> = {
  AC: '10:00',
  NonAC: '11:00',
}

/**
 * Tatkal booking opens exactly one day before the journey date (at the
 * class-specific time above). E.g. a 26 Dec journey opens for Tatkal on 25 Dec
 * at 10:00/11:00 IST.
 */
export const TATKAL_OPENS_DAYS_BEFORE_JOURNEY = 1

/** Default advance reservation period used when a plan has no linked booking. */
export const DEFAULT_TATKAL_BOOKING_WINDOW_DAYS = 60