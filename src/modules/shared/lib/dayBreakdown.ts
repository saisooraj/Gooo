import { eachDateInRange, isWeekend } from '@/utils/date'
import type { DateKey, WeekendConfig } from '@/utils/date'

export interface DayBreakdown {
  holidayDays: number
  weekendDays: number
  /** Days that would actually require a leave application if taken off. */
  workdays: number
  /** Workdays explicitly marked as not requiring leave (e.g. a travel day after work hours). */
  excludedWorkdays: number
  totalDays: number
}

/**
 * Splits a date range into holiday/weekend/workday counts. Used to derive
 * the *actual leave cost* of a trip — a 4-day trip spanning a weekend only
 * costs 2 leave days, not 4. Shared by analytics (reserved/consumed leave)
 * and the dashboard so both agree on the same arithmetic.
 *
 * `excludedLeaveDates` lets a caller carve specific workdays back out of the
 * leave cost — e.g. a trip's departure date where travel happened after work
 * hours and no leave was actually taken.
 */
export function classifyDateRange(
  start: DateKey,
  end: DateKey,
  holidayDates: ReadonlySet<DateKey>,
  weekend: WeekendConfig,
  excludedLeaveDates: ReadonlySet<DateKey> = new Set(),
): DayBreakdown {
  let holidayDays = 0
  let weekendDays = 0
  let workdays = 0
  let excludedWorkdays = 0

  for (const day of eachDateInRange(start, end)) {
    if (holidayDates.has(day)) holidayDays++
    else if (isWeekend(day, weekend)) weekendDays++
    else if (excludedLeaveDates.has(day)) excludedWorkdays++
    else workdays++
  }

  return {
    holidayDays,
    weekendDays,
    workdays,
    excludedWorkdays,
    totalDays: holidayDays + weekendDays + workdays + excludedWorkdays,
  }
}
