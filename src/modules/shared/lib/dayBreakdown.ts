import { eachDateInRange, isWeekend } from '@/utils/date'
import type { DateKey, WeekendConfig } from '@/utils/date'

export interface DayBreakdown {
  holidayDays: number
  weekendDays: number
  /** Days that would actually require a leave application if taken off. */
  workdays: number
  totalDays: number
}

/**
 * Splits a date range into holiday/weekend/workday counts. Used to derive
 * the *actual leave cost* of a trip — a 4-day trip spanning a weekend only
 * costs 2 leave days, not 4. Shared by analytics (reserved/consumed leave)
 * and the dashboard so both agree on the same arithmetic.
 */
export function classifyDateRange(
  start: DateKey,
  end: DateKey,
  holidayDates: ReadonlySet<DateKey>,
  weekend: WeekendConfig,
): DayBreakdown {
  let holidayDays = 0
  let weekendDays = 0
  let workdays = 0

  for (const day of eachDateInRange(start, end)) {
    if (holidayDates.has(day)) holidayDays++
    else if (isWeekend(day, weekend)) weekendDays++
    else workdays++
  }

  return { holidayDays, weekendDays, workdays, totalDays: holidayDays + weekendDays + workdays }
}
