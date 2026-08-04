import { describe, expect, it } from 'vitest'
import { computeBookingConfidence } from './confidence'

describe('computeBookingConfidence', () => {
  it('is high for low demand, early timing, no pressure', () => {
    const r = computeBookingConfidence({
      demand: 'Low',
      timing: 'early',
      isWeekend: false,
      isHoliday: false,
      isFestival: false,
    })
    expect(r.score).toBe(100)
    expect(r.level).toBe('high')
  })

  it('penalizes high demand', () => {
    const r = computeBookingConfidence({
      demand: 'High',
      timing: 'on-time',
      isWeekend: false,
      isHoliday: false,
      isFestival: false,
    })
    expect(r.score).toBe(70)
    expect(r.level).toBe('high')
  })

  it('combines festival + very high demand + late timing into low confidence', () => {
    const r = computeBookingConfidence({
      demand: 'Very High',
      timing: 'late',
      isWeekend: true,
      isHoliday: true,
      isFestival: true,
    })
    // 100 - 40 - 20 - 5 - 10 - 15 = 10
    expect(r.score).toBe(10)
    expect(r.level).toBe('low')
  })

  it('reduces confidence with waitlist depth, capped at 30', () => {
    const r = computeBookingConfidence({
      demand: 'Medium',
      timing: 'on-time',
      isWeekend: false,
      isHoliday: false,
      isFestival: false,
      wlNumber: 20,
    })
    // 100 - 10 - 5 - min(30, 60) = 55
    expect(r.score).toBe(55)
    expect(r.level).toBe('medium')
  })

  it('clamps to 0', () => {
    const r = computeBookingConfidence({
      demand: 'Very High',
      timing: 'late',
      isWeekend: true,
      isHoliday: true,
      isFestival: true,
      wlNumber: 100,
    })
    expect(r.score).toBe(0)
    expect(r.level).toBe('low')
  })

  it('treats medium demand + on-time as medium confidence', () => {
    const r = computeBookingConfidence({
      demand: 'Medium',
      timing: 'on-time',
      isWeekend: false,
      isHoliday: false,
      isFestival: false,
    })
    expect(r.score).toBe(85)
    expect(r.level).toBe('high')
  })
})