import { describe, expect, it } from 'vitest'
import { computeTatkalAnalytics } from './analytics'
import type { BackupOption, TatkalPlan } from '../types/tatkal.types'

function makePlan(overrides: Partial<TatkalPlan> = {}): TatkalPlan {
  return {
    id: 'p1',
    userId: 'u1',
    createdAt: '',
    updatedAt: '',
    tripId: 't1',
    boardingStation: 'A',
    destinationStation: 'B',
    journeyDate: '2026-12-26',
    reservationOpensOn: '2026-12-23',
    tatkalClass: 'AC',
    status: 'Waiting List',
    demand: 'High',
    wlHistory: [],
    checklist: {
      passengerDetailsSaved: false,
      preferredTrainSelected: false,
      boardingStationVerified: false,
      paymentMethodReady: false,
    },
    ...overrides,
  } as TatkalPlan
}

function makeBackup(overrides: Partial<BackupOption> = {}): BackupOption {
  return {
    id: 'b1',
    userId: 'u1',
    createdAt: '',
    updatedAt: '',
    tatkalPlanId: 'p1',
    priority: 1,
    mode: 'Train',
    status: 'Added',
    isAutoSuggested: false,
    ...overrides,
  } as BackupOption
}

describe('computeTatkalAnalytics', () => {
  it('counts total plans', () => {
    const r = computeTatkalAnalytics([makePlan({ id: 'a' }), makePlan({ id: 'b' })], [], '2026-12-25')
    expect(r.totalPlans).toBe(2)
  })

  it('counts confirmed plans', () => {
    const r = computeTatkalAnalytics(
      [makePlan({ id: 'a', status: 'Confirmed' }), makePlan({ id: 'b', status: 'Tatkal Booked' })],
      [],
      '2026-12-25',
    )
    expect(r.confirmedCount).toBe(2)
  })

  it('counts cancelled plans', () => {
    const r = computeTatkalAnalytics(
      [makePlan({ id: 'a', status: 'Cancelled' }), makePlan({ id: 'b', status: 'Completed' })],
      [],
      '2026-12-25',
    )
    expect(r.cancelledCount).toBe(2)
  })

  it('counts pending vs missed by journey date relative to asOf', () => {
    const r = computeTatkalAnalytics(
      [
        makePlan({ id: 'a', journeyDate: '2026-12-28' }), // future → pending
        makePlan({ id: 'b', journeyDate: '2026-12-20' }), // past → missed
      ],
      [],
      '2026-12-25',
    )
    expect(r.pendingCount).toBe(1)
    expect(r.missedCount).toBe(1)
  })

  it('computes success rate as confirmed / (confirmed + missed)', () => {
    const r = computeTatkalAnalytics(
      [
        makePlan({ id: 'a', status: 'Confirmed' }),
        makePlan({ id: 'b', journeyDate: '2026-12-20' }), // missed
        makePlan({ id: 'c', journeyDate: '2026-12-20' }), // missed
      ],
      [],
      '2026-12-25',
    )
    // 1 confirmed / (1 + 2) = 33.33...
    expect(r.successRate).toBeCloseTo(33.33, 1)
  })

  it('returns 0 success rate when nothing is confirmed or missed', () => {
    const r = computeTatkalAnalytics([], [], '2026-12-25')
    expect(r.successRate).toBe(0)
  })

  it('averages current WL across waitlisted plans', () => {
    const r = computeTatkalAnalytics(
      [makePlan({ id: 'a', currentWlNumber: 10 }), makePlan({ id: 'b', currentWlNumber: 20 })],
      [],
      '2026-12-25',
    )
    expect(r.averageCurrentWl).toBe(15)
  })

  it('counts WL history entries', () => {
    const r = computeTatkalAnalytics(
      [
        makePlan({ id: 'a', wlHistory: [{ date: '2026-12-20', wlNumber: 10, status: 'Waiting List' }] }),
        makePlan({
          id: 'b',
          wlHistory: [
            { date: '2026-12-20', wlNumber: 10, status: 'Waiting List' },
            { date: '2026-12-21', wlNumber: 8, status: 'Waiting List' },
          ],
        }),
      ],
      [],
      '2026-12-25',
    )
    expect(r.totalWlHistoryEntries).toBe(3)
  })

  it('counts plans with backups and backup stats', () => {
    const r = computeTatkalAnalytics(
      [makePlan({ id: 'a' }), makePlan({ id: 'b' })],
      [
        makeBackup({ id: 'x', tatkalPlanId: 'a', status: 'Booked', isAutoSuggested: true }),
        makeBackup({ id: 'y', tatkalPlanId: 'a', status: 'Added', isAutoSuggested: false }),
      ],
      '2026-12-25',
    )
    expect(r.plansWithBackups).toBe(1)
    expect(r.totalBackups).toBe(2)
    expect(r.backupsBooked).toBe(1)
    expect(r.autoSuggestedBackups).toBe(1)
  })
})