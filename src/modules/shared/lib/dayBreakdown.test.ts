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
    expect(result).toEqual({ holidayDays: 1, weekendDays: 2, workdays: 1, totalDays: 4 })
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
})
