import { describe, expect, it } from 'vitest'
import { WEEKEND_PRESETS } from '@/utils/date'
import { classifyDateRange } from './dayBreakdown'

describe('classifyDateRange', () => {
  it('splits a trip spanning a holiday and a weekend correctly', () => {
    // 2026-01-01 Thu (holiday), 01-02 Fri (workday), 01-03 Sat, 01-04 Sun
    const result = classifyDateRange(
      '2026-01-01',
      '2026-01-04',
      new Set(['2026-01-01']),
      WEEKEND_PRESETS.SAT_SUN,
    )
    expect(result).toEqual({ holidayDays: 1, weekendDays: 2, workdays: 1, excludedWorkdays: 0, totalDays: 4 })
  })

  it('counts a trip entirely on workdays as full leave cost', () => {
    const result = classifyDateRange('2026-01-05', '2026-01-07', new Set(), WEEKEND_PRESETS.SAT_SUN)
    expect(result.workdays).toBe(3)
    expect(result.holidayDays).toBe(0)
    expect(result.weekendDays).toBe(0)
  })

  it('counts a weekend-only trip as zero leave cost', () => {
    const result = classifyDateRange('2026-01-03', '2026-01-04', new Set(), WEEKEND_PRESETS.SAT_SUN)
    expect(result.workdays).toBe(0)
    expect(result.weekendDays).toBe(2)
  })

  it('carves excluded dates out of the leave cost without dropping them from the trip', () => {
    // 2026-08-21 Fri (travel day, excluded), 08-22 Sat, 08-23 Sun, 08-24/25/26 Mon-Wed (leave).
    const result = classifyDateRange(
      '2026-08-21',
      '2026-08-26',
      new Set(),
      WEEKEND_PRESETS.SAT_SUN,
      new Set(['2026-08-21']),
    )
    expect(result).toEqual({ holidayDays: 0, weekendDays: 2, workdays: 3, excludedWorkdays: 1, totalDays: 6 })
  })

  it('ignores an excluded date that falls on a weekend or holiday — those are never counted as leave anyway', () => {
    const result = classifyDateRange(
      '2026-01-01',
      '2026-01-04',
      new Set(['2026-01-01']),
      WEEKEND_PRESETS.SAT_SUN,
      new Set(['2026-01-01', '2026-01-03']),
    )
    expect(result).toEqual({ holidayDays: 1, weekendDays: 2, workdays: 1, excludedWorkdays: 0, totalDays: 4 })
  })
})
