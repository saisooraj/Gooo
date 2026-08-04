import { describe, expect, it } from 'vitest'
import {
  addDays,
  daysInYear,
  diffDaysInclusive,
  eachDateInRange,
  isLeapYear,
  isWeekend,
  WEEKEND_PRESETS,
  getWeekday,
} from './date'

describe('leap year handling', () => {
  it.each([
    [2000, true],
    [1900, false],
    [2024, true],
    [2023, false],
    [2028, true],
  ])('year %i isLeapYear -> %s', (year, expected) => {
    expect(isLeapYear(year)).toBe(expected)
  })

  it('returns 366 days for a leap year and 365 otherwise', () => {
    expect(daysInYear(2024)).toBe(366)
    expect(daysInYear(2023)).toBe(365)
  })
})

describe('weekend definitions', () => {
  it('treats Saturday and Sunday as weekend under the default preset', () => {
    expect(isWeekend('2026-08-01', WEEKEND_PRESETS.SAT_SUN)).toBe(true) // Saturday
    expect(isWeekend('2026-08-02', WEEKEND_PRESETS.SAT_SUN)).toBe(true) // Sunday
    expect(isWeekend('2026-08-03', WEEKEND_PRESETS.SAT_SUN)).toBe(false) // Monday
  })

  it('treats Friday and Saturday as weekend under the Middle East preset', () => {
    expect(isWeekend('2026-07-31', WEEKEND_PRESETS.FRI_SAT)).toBe(true) // Friday
    expect(isWeekend('2026-08-01', WEEKEND_PRESETS.FRI_SAT)).toBe(true) // Saturday
    expect(isWeekend('2026-08-02', WEEKEND_PRESETS.FRI_SAT)).toBe(false) // Sunday
  })
})

describe('date arithmetic', () => {
  it('adds days across a month/year boundary', () => {
    expect(addDays('2025-12-30', 3)).toBe('2026-01-02')
  })

  it('handles Feb 29 correctly in a leap year', () => {
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29')
    expect(addDays('2024-02-29', 1)).toBe('2024-03-01')
  })

  it('computes inclusive day counts', () => {
    expect(diffDaysInclusive('2026-08-01', '2026-08-01')).toBe(1)
    expect(diffDaysInclusive('2026-08-01', '2026-08-04')).toBe(4)
  })

  it('enumerates every date in a range', () => {
    expect(eachDateInRange('2026-08-01', '2026-08-03')).toEqual([
      '2026-08-01',
      '2026-08-02',
      '2026-08-03',
    ])
  })

  it('returns the correct weekday index', () => {
    expect(getWeekday('2026-08-01')).toBe(6) // Saturday
    expect(getWeekday('2026-08-03')).toBe(1) // Monday
  })
})
