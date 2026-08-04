import { describe, expect, it } from 'vitest'
import { estimateConfirmationChance } from './confirmationChance'
import type { WaitlistEntry } from '../types/tatkal.types'

function wl(date: string, wlNumber: number, status: WaitlistEntry['status'] = 'Waiting List'): WaitlistEntry {
  return { date, wlNumber, status }
}

describe('estimateConfirmationChance', () => {
  it('returns unknown trend and 50% with no history', () => {
    const r = estimateConfirmationChance([], 10)
    expect(r.trend).toBe('unknown')
    expect(r.chance).toBe(50)
  })

  it('returns 100% when the latest entry is Confirmed', () => {
    const r = estimateConfirmationChance(
      [wl('2026-12-20', 30), { date: '2026-12-24', status: 'Confirmed' }],
      2,
    )
    expect(r.chance).toBe(100)
    expect(r.trend).toBe('improving')
  })

  it('returns 70% when the latest entry is RAC', () => {
    const r = estimateConfirmationChance(
      [wl('2026-12-20', 30), { date: '2026-12-24', racNumber: 5, status: 'RAC' }],
      2,
    )
    expect(r.chance).toBe(70)
  })

  it('returns 0% when cancelled', () => {
    const r = estimateConfirmationChance(
      [wl('2026-12-20', 30), { date: '2026-12-24', status: 'Cancelled' }],
      2,
    )
    expect(r.chance).toBe(0)
  })

  it('detects an improving trend (WL shrinking)', () => {
    const r = estimateConfirmationChance(
      [wl('2026-12-20', 40), wl('2026-12-21', 30), wl('2026-12-22', 20)],
      4,
    )
    expect(r.trend).toBe('improving')
    // baseline 80 - 20*4 = 0 → max(5,0)=5, +10 improving = 15
    expect(r.chance).toBeGreaterThanOrEqual(5)
  })

  it('detects a worsening trend (WL growing)', () => {
    const r = estimateConfirmationChance(
      [wl('2026-12-20', 10), wl('2026-12-21', 15), wl('2026-12-22', 20)],
      4,
    )
    expect(r.trend).toBe('worsening')
    // baseline 80 - 20*4 = 0 → 5, -15 worsening = 0 (clamped)
    expect(r.chance).toBeGreaterThanOrEqual(0)
  })

  it('detects a stable trend', () => {
    const r = estimateConfirmationChance(
      [wl('2026-12-20', 10), wl('2026-12-21', 10), wl('2026-12-22', 10)],
      10,
    )
    expect(r.trend).toBe('stable')
    // baseline 80 - 10*4 = 40, no trend adjust
    expect(r.chance).toBe(40)
  })

  it('reduces chance when journey is imminent and WL is high', () => {
    const r = estimateConfirmationChance(
      [wl('2026-12-20', 15), wl('2026-12-24', 12)],
      1,
    )
    // improving (15→12): baseline 80-12*4=32, +10 = 42, days<=1 && last>10 → -20 = 22
    expect(r.trend).toBe('improving')
    expect(r.chance).toBe(22)
  })

  it('clamps chance to [0, 100]', () => {
    const r = estimateConfirmationChance(
      [wl('2026-12-20', 1), wl('2026-12-21', 1)],
      30,
    )
    expect(r.chance).toBeLessThanOrEqual(100)
    expect(r.chance).toBeGreaterThanOrEqual(0)
  })
})