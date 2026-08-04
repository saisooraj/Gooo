import { describe, expect, it } from 'vitest'
import { computeTatkalWindow, getTatkalCountdownLabel } from './tatkalWindow'

describe('computeTatkalWindow', () => {
  it('opens exactly one day before the journey date', () => {
    const w = computeTatkalWindow('2026-12-26', 'AC', '2026-12-01')
    expect(w.tatkalOpensOn).toBe('2026-12-25')
    expect(w.tatkalOpensAt).toBe('10:00')
    expect(w.tatkalOpensAtIso).toBe('2026-12-25T10:00:00')
  })

  it('uses 11:00 for Non-AC class', () => {
    const w = computeTatkalWindow('2026-12-26', 'NonAC', '2026-12-01')
    expect(w.tatkalOpensAt).toBe('11:00')
  })

  it('is far when more than 5 days remain', () => {
    expect(computeTatkalWindow('2026-12-26', 'AC', '2026-12-15').status).toBe('far')
  })

  it('is upcoming within 2-5 days', () => {
    expect(computeTatkalWindow('2026-12-26', 'AC', '2026-12-22').status).toBe('upcoming')
    expect(computeTatkalWindow('2026-12-26', 'AC', '2026-12-21').status).toBe('upcoming')
  })

  it('is tomorrow the day before opening', () => {
    expect(computeTatkalWindow('2026-12-26', 'AC', '2026-12-24').status).toBe('tomorrow')
  })

  it('is today on the opening date', () => {
    expect(computeTatkalWindow('2026-12-26', 'AC', '2026-12-25').status).toBe('today')
  })

  it('is open on the journey date itself (window opened yesterday)', () => {
    expect(computeTatkalWindow('2026-12-26', 'AC', '2026-12-26').status).toBe('open')
  })

  it('is passed after the journey date', () => {
    expect(computeTatkalWindow('2026-12-26', 'AC', '2026-12-27').status).toBe('passed')
  })
})

describe('getTatkalCountdownLabel', () => {
  it('shows the opening date when far', () => {
    const w = computeTatkalWindow('2026-12-26', 'AC', '2026-12-15')
    expect(getTatkalCountdownLabel(w)).toBe('Opens 25 Dec 2026')
  })

  it('shows days remaining when upcoming', () => {
    const w = computeTatkalWindow('2026-12-26', 'AC', '2026-12-22')
    expect(getTatkalCountdownLabel(w)).toBe('Opens in 3d')
  })

  it('shows "Opens tomorrow" the day before', () => {
    const w = computeTatkalWindow('2026-12-26', 'AC', '2026-12-24')
    expect(getTatkalCountdownLabel(w)).toBe('Opens tomorrow')
  })

  it('shows "Opens today" without a now timestamp', () => {
    const w = computeTatkalWindow('2026-12-26', 'AC', '2026-12-25')
    expect(getTatkalCountdownLabel(w)).toBe('Opens today')
  })

  it('resolves to hours when opening is later the same day', () => {
    const w = computeTatkalWindow('2026-12-26', 'AC', '2026-12-25')
    // 07:30 on opening day → 2h30m until 10:00 → "Opens in 2h"
    const now = new Date('2026-12-25T07:30:00')
    expect(getTatkalCountdownLabel(w, now)).toBe('Opens in 2h')
  })

  it('resolves to minutes when under an hour remains', () => {
    const w = computeTatkalWindow('2026-12-26', 'AC', '2026-12-25')
    const now = new Date('2026-12-25T09:35:00')
    expect(getTatkalCountdownLabel(w, now)).toBe('Opens in 25m')
  })

  it('shows "Open now" once the opening time has passed on opening day', () => {
    const w = computeTatkalWindow('2026-12-26', 'AC', '2026-12-25')
    const now = new Date('2026-12-25T10:05:00')
    expect(getTatkalCountdownLabel(w, now)).toBe('Open now')
  })

  it('shows "Tatkal open" on the journey date', () => {
    const w = computeTatkalWindow('2026-12-26', 'AC', '2026-12-26')
    expect(getTatkalCountdownLabel(w)).toBe('Tatkal open')
  })

  it('shows "Window passed" after the journey date', () => {
    const w = computeTatkalWindow('2026-12-26', 'AC', '2026-12-27')
    expect(getTatkalCountdownLabel(w)).toBe('Window passed')
  })
})