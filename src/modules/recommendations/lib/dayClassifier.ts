import { eachDateInRange, endOfYear, isWeekend, startOfYear } from '@/utils/date'
import type { DateKey, WeekendConfig } from '@/utils/date'
import type { EngineHoliday } from '../types/recommendation.types'

export type DayKind = 'holiday' | 'weekend' | 'workday'

export interface ClassifiedDay {
  date: DateKey
  kind: DayKind
  holidayName?: string
}

/**
 * Classifies every day of a calendar year as a holiday, weekend, or workday.
 * Holidays take precedence over weekends when a holiday falls on one.
 */
export function classifyYear(
  year: number,
  holidays: EngineHoliday[],
  weekend: WeekendConfig,
): ClassifiedDay[] {
  const holidayByDate = new Map(holidays.map((holiday) => [holiday.date, holiday]))

  return eachDateInRange(startOfYear(year), endOfYear(year)).map((date): ClassifiedDay => {
    const holiday = holidayByDate.get(date)
    if (holiday) return { date, kind: 'holiday', holidayName: holiday.name }
    if (isWeekend(date, weekend)) return { date, kind: 'weekend' }
    return { date, kind: 'workday' }
  })
}
