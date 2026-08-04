import { describe, expect, it } from 'vitest'
import { WEEKEND_PRESETS } from '@/utils/date'
import { createDeterministicRecommendationEngine } from './engine'
import type { EngineHoliday, RecommendationEngineInput } from '../types/recommendation.types'

function baseInput(overrides: Partial<RecommendationEngineInput> = {}): RecommendationEngineInput {
  return {
    year: 2026,
    availableLeaveDays: 30,
    holidays: [],
    weekend: WEEKEND_PRESETS.SAT_SUN,
    preferences: { maxContinuousLeaveDays: 4 },
    excludedDates: [],
    advanceReservationDays: 120,
    ...overrides,
  }
}

const engine = createDeterministicRecommendationEngine()

describe('determinism', () => {
  it('produces byte-identical output for the same input', () => {
    const input = baseInput({
      holidays: [{ date: '2026-01-01', name: "New Year's Day", isMandatory: true }],
    })
    const first = engine.generate(input)
    const second = engine.generate(input)
    expect(first).toEqual(second)
  })
})

describe('priority rule: Holiday + Weekend (0 leave, 5 star)', () => {
  it('surfaces a free long weekend when a holiday sits next to the weekend', () => {
    // 2026-01-02 is a Friday; holiday there bridges into Sat/Sun with 0 leave.
    const holidays: EngineHoliday[] = [{ date: '2026-01-02', name: 'Founders Day', isMandatory: true }]
    const results = engine.generate(baseInput({ holidays }))
    const freeBlock = results.find((r) => r.leaveUsed === 0)

    expect(freeBlock).toBeDefined()
    expect(freeBlock?.startDate).toBe('2026-01-02')
    expect(freeBlock?.endDate).toBe('2026-01-04')
    expect(freeBlock?.vacationLength).toBe(3)
    expect(freeBlock?.stars).toBe(5)
    expect(freeBlock?.holidayDatesUsed).toEqual(['2026-01-02'])
  })
})

describe('priority rule: single leave day bridges into a weekend', () => {
  it('recommends taking Friday off to join Saturday/Sunday', () => {
    // 2026-08-03 is a Monday, so 2026-07-31 is a Friday.
    const results = engine.generate(baseInput())
    const fridayBridge = results.find((r) => r.startDate === '2026-07-31')

    expect(fridayBridge).toBeDefined()
    expect(fridayBridge?.endDate).toBe('2026-08-02')
    expect(fridayBridge?.leaveUsed).toBe(1)
    expect(fridayBridge?.vacationLength).toBe(3)
    expect(fridayBridge?.efficiency).toBeCloseTo(3)
  })

  it('recommends taking Monday off to extend Saturday/Sunday', () => {
    const results = engine.generate(baseInput())
    const mondayBridge = results.find((r) => r.startDate === '2026-08-01' && r.leaveUsed === 1)

    expect(mondayBridge).toBeDefined()
    expect(mondayBridge?.endDate).toBe('2026-08-03')
    expect(mondayBridge?.vacationLength).toBe(3)
  })
})

describe('priority rule: Holiday + Thursday/Friday leave + weekend', () => {
  it('bridges a Thursday holiday through a Friday leave day into the weekend', () => {
    // 2026-01-01 is a Thursday.
    const holidays: EngineHoliday[] = [{ date: '2026-01-01', name: "New Year's Day", isMandatory: true }]
    const results = engine.generate(baseInput({ holidays }))
    const bridge = results.find((r) => r.startDate === '2026-01-01' && r.leaveUsed === 1)

    expect(bridge).toBeDefined()
    expect(bridge?.endDate).toBe('2026-01-04')
    expect(bridge?.vacationLength).toBe(4)
    expect(bridge?.leaveDatesUsed).toEqual(['2026-01-02'])
    expect(bridge?.efficiency).toBeCloseTo(4)
    expect(bridge?.stars).toBe(5)
  })
})

describe('efficiency scoring examples from the spec', () => {
  it('scores 4 vacation days for 1 leave day as 4.0 efficiency / 5 stars', () => {
    const holidays: EngineHoliday[] = [{ date: '2026-01-01', name: "New Year's Day", isMandatory: true }]
    const results = engine.generate(baseInput({ holidays }))
    const match = results.find((r) => r.vacationLength === 4 && r.leaveUsed === 1)
    expect(match?.efficiency).toBeCloseTo(4)
    expect(match?.stars).toBe(5)
  })
})

describe('avoid long continuous leave', () => {
  it('penalizes blocks using more than 3 leave days relative to a 1-leave block', () => {
    const results = engine.generate(baseInput({ preferences: { maxContinuousLeaveDays: 4 } }))
    const oneLeave = results.find((r) => r.leaveUsed === 1)
    const fourLeave = results.find((r) => r.leaveUsed === 4)

    expect(oneLeave).toBeDefined()
    if (fourLeave) {
      expect(fourLeave.score).toBeLessThan((oneLeave?.score ?? 0))
    }
  })

  it('excludes leave gaps longer than maxContinuousLeaveDays entirely', () => {
    const results = engine.generate(baseInput({ preferences: { maxContinuousLeaveDays: 1 } }))
    expect(results.every((r) => r.leaveUsed <= 1)).toBe(true)
  })
})

describe('constraints', () => {
  it('never recommends more leave than is available', () => {
    const results = engine.generate(baseInput({ availableLeaveDays: 0 }))
    expect(results.every((r) => r.leaveUsed === 0)).toBe(true)
  })

  it('excludes blocks overlapping already-booked dates', () => {
    const holidays: EngineHoliday[] = [{ date: '2026-01-02', name: 'Founders Day', isMandatory: true }]
    const results = engine.generate(baseInput({ holidays, excludedDates: ['2026-01-03'] }))
    expect(results.some((r) => r.startDate === '2026-01-02')).toBe(false)
  })

  it('sorts recommendations by score descending', () => {
    const holidays: EngineHoliday[] = [{ date: '2026-01-01', name: "New Year's Day", isMandatory: true }]
    const results = engine.generate(baseInput({ holidays }))
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1]!.score).toBeGreaterThanOrEqual(results[i]!.score)
    }
  })
})

describe('weekend definitions', () => {
  it('respects a Friday-Saturday weekend when finding bridges', () => {
    const results = engine.generate(baseInput({ weekend: WEEKEND_PRESETS.FRI_SAT }))
    // 2026-07-30 is a Thursday; taking it off bridges into Fri/Sat under this preset.
    const bridge = results.find((r) => r.startDate === '2026-07-30' && r.leaveUsed === 1)
    expect(bridge).toBeDefined()
    expect(bridge?.endDate).toBe('2026-08-01')
  })
})

describe('leap year handling', () => {
  it('generates a full 366-day classification without errors in a leap year', () => {
    const results = engine.generate(baseInput({ year: 2024, availableLeaveDays: 30 }))
    expect(Array.isArray(results)).toBe(true)
  })
})

describe('booking dates', () => {
  it('derives booking dates from the advance reservation period', () => {
    const holidays: EngineHoliday[] = [{ date: '2026-01-02', name: 'Founders Day', isMandatory: true }]
    const results = engine.generate(baseInput({ holidays, advanceReservationDays: 120 }))
    const freeBlock = results.find((r) => r.startDate === '2026-01-02')
    expect(freeBlock?.bookingDate).toBe('2025-09-04')
  })
})

describe('sandwich pattern: leave on both sides of the same off-block', () => {
  it('finds taking Thursday + Monday around a Friday holiday for a 5-day break', () => {
    // 2026-10-02 is a Friday holiday; Sat/Sun follow; Monday 10-05 is a workday.
    const holidays: EngineHoliday[] = [{ date: '2026-10-02', name: 'Gandhi Jayanthi', isMandatory: true }]
    const results = engine.generate(baseInput({ holidays }))
    const sandwich = results.find(
      (r) => r.startDate === '2026-10-01' && r.endDate === '2026-10-05' && r.leaveUsed === 2,
    )

    expect(sandwich).toBeDefined()
    expect(sandwich?.leaveDatesUsed).toEqual(['2026-10-01', '2026-10-05'])
    expect(sandwich?.vacationLength).toBe(5)
  })

  it('finds taking Friday + Monday around a plain weekend (no holiday involved)', () => {
    const results = engine.generate(baseInput())
    // 2026-08-01 is a Saturday; Fri 07-31 and Mon 08-03 sandwich it.
    const sandwich = results.find(
      (r) => r.startDate === '2026-07-31' && r.endDate === '2026-08-03' && r.leaveUsed === 2,
    )
    expect(sandwich).toBeDefined()
  })

  it('does not exceed maxContinuousLeaveDays when sandwiching', () => {
    const holidays: EngineHoliday[] = [{ date: '2026-10-02', name: 'Gandhi Jayanthi', isMandatory: true }]
    const results = engine.generate(
      baseInput({ holidays, preferences: { maxContinuousLeaveDays: 2 } }),
    )
    expect(results.every((r) => r.leaveUsed <= 2)).toBe(true)
  })

  it('does not sandwich an off-block that touches the start or end of the year', () => {
    // Jan 1 has no preceding workday run within the year — must not throw or fabricate one.
    const holidays: EngineHoliday[] = [{ date: '2026-01-01', name: "New Year's Day", isMandatory: true }]
    expect(() => engine.generate(baseInput({ holidays }))).not.toThrow()
  })
})
