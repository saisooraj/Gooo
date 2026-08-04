import dayjs, { type Dayjs } from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isLeapYearPlugin from 'dayjs/plugin/isLeapYear'

dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)
dayjs.extend(isLeapYearPlugin)

/**
 * Canonical serializable date representation used everywhere in the app
 * (Firestore documents, pure calculation functions, tests). Storing dates
 * as `YYYY-MM-DD` strings instead of `Date`/`Dayjs` objects keeps every
 * calculation timezone-independent and trivially comparable/sortable.
 */
export type DateKey = string

const DATE_FORMAT = 'YYYY-MM-DD'

/** Day-of-week index used across the app: 0 = Sunday … 6 = Saturday. */
export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6

export const WEEKDAY_NAMES: Record<WeekdayIndex, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
}

function toDayjs(value: DateKey | Date | Dayjs): Dayjs {
  return dayjs.isDayjs(value) ? value : dayjs(value)
}

export function toDateKey(value: Date | Dayjs | DateKey): DateKey {
  return toDayjs(value).format(DATE_FORMAT)
}

export function todayKey(): DateKey {
  return toDateKey(dayjs())
}

export function isValidDateKey(value: string): value is DateKey {
  return dayjs(value, DATE_FORMAT, true).isValid()
}

export function addDays(key: DateKey, amount: number): DateKey {
  return toDateKey(toDayjs(key).add(amount, 'day'))
}

export function subtractDays(key: DateKey, amount: number): DateKey {
  return addDays(key, -amount)
}

/** Inclusive day count between two dates, e.g. same day = 1, next day = 2. */
export function diffDaysInclusive(start: DateKey, end: DateKey): number {
  return toDayjs(end).diff(toDayjs(start), 'day') + 1
}

export function diffDays(start: DateKey, end: DateKey): number {
  return toDayjs(end).diff(toDayjs(start), 'day')
}

export function compareDateKeys(a: DateKey, b: DateKey): number {
  if (a === b) return 0
  return a < b ? -1 : 1
}

export function isBefore(a: DateKey, b: DateKey): boolean {
  return toDayjs(a).isBefore(toDayjs(b))
}

export function isAfter(a: DateKey, b: DateKey): boolean {
  return toDayjs(a).isAfter(toDayjs(b))
}

export function isSameOrBeforeKey(a: DateKey, b: DateKey): boolean {
  return toDayjs(a).isSameOrBefore(toDayjs(b))
}

export function isSameOrAfterKey(a: DateKey, b: DateKey): boolean {
  return toDayjs(a).isSameOrAfter(toDayjs(b))
}

export function isBetweenInclusive(key: DateKey, start: DateKey, end: DateKey): boolean {
  return isSameOrAfterKey(key, start) && isSameOrBeforeKey(key, end)
}

export function getWeekday(key: DateKey): WeekdayIndex {
  return toDayjs(key).day() as WeekdayIndex
}

export function isLeapYear(year: number): boolean {
  return dayjs(`${year}-01-01`).isLeapYear()
}

export function daysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365
}

/**
 * Weekend definitions vary by country/organization (e.g. Sun–Sat weekends in
 * most of the world, Fri–Sat across much of the Middle East). Callers pass
 * the applicable set of weekday indices instead of it being hardcoded, so
 * the recommendation engine works for any weekend convention.
 */
export type WeekendConfig = readonly WeekdayIndex[]

export const WEEKEND_PRESETS = {
  /** Saturday & Sunday — most of the world. */
  SAT_SUN: [0, 6] as WeekendConfig,
  /** Friday & Saturday — much of the Middle East. */
  FRI_SAT: [5, 6] as WeekendConfig,
  /** Sunday only — some Latin American / retail-heavy schedules. */
  SUN_ONLY: [0] as WeekendConfig,
} as const

export function isWeekend(key: DateKey, weekend: WeekendConfig = WEEKEND_PRESETS.SAT_SUN): boolean {
  return weekend.includes(getWeekday(key))
}

export function eachDateInRange(start: DateKey, end: DateKey): DateKey[] {
  const dates: DateKey[] = []
  let cursor = start
  while (isSameOrBeforeKey(cursor, end)) {
    dates.push(cursor)
    cursor = addDays(cursor, 1)
  }
  return dates
}

export function formatDisplay(key: DateKey, format = 'DD MMM YYYY'): string {
  return toDayjs(key).format(format)
}

export function startOfYear(year: number): DateKey {
  return toDateKey(dayjs(`${year}-01-01`))
}

export function endOfYear(year: number): DateKey {
  return toDateKey(dayjs(`${year}-12-31`))
}

export function getYear(key: DateKey): number {
  return toDayjs(key).year()
}

export function getMonth(key: DateKey): number {
  return toDayjs(key).month() + 1
}

export function startOfMonth(year: number, month: number): DateKey {
  return toDateKey(dayjs(`${year}-${String(month).padStart(2, '0')}-01`))
}

export function daysInMonth(year: number, month: number): number {
  return dayjs(`${year}-${String(month).padStart(2, '0')}-01`).daysInMonth()
}
