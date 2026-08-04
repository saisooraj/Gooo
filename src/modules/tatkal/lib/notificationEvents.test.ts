import { describe, expect, it } from 'vitest'
import { buildDueTatkalNotificationEvents, groupBackupsByPlan } from './notificationEvents'
import type { BackupOption, TatkalPlan } from '../types/tatkal.types'

function makePlan(overrides: Partial<TatkalPlan> = {}): TatkalPlan {
  return {
    id: 'p1',
    userId: 'u1',
    createdAt: '',
    updatedAt: '',
    tripId: 't1',
    boardingStation: 'KSR Bengaluru',
    destinationStation: 'Ernakulam Jn',
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

describe('buildDueTatkalNotificationEvents', () => {
  it('emits reservationOpensSoon within 3 days of reservation opening', () => {
    const events = buildDueTatkalNotificationEvents({
      plans: [makePlan({ reservationOpensOn: '2026-12-25' })],
      backupsByPlanId: new Map(),
      asOf: '2026-12-23',
    })
    expect(events.some((e) => e.type === 'reservationOpensSoon')).toBe(true)
  })

  it('emits tatkalWindowOpensSoon 1-2 days before the Tatkal window', () => {
    // journey 2026-12-26 → tatkal opens 2026-12-25; asOf 2026-12-24 → 1 day
    const events = buildDueTatkalNotificationEvents({
      plans: [makePlan()],
      backupsByPlanId: new Map([['p1', [makeBackup()]]]),
      asOf: '2026-12-24',
    })
    expect(events.some((e) => e.type === 'tatkalWindowOpensSoon')).toBe(true)
  })

  it('emits tatkalWindowOpenNow on the opening day', () => {
    const events = buildDueTatkalNotificationEvents({
      plans: [makePlan()],
      backupsByPlanId: new Map([['p1', [makeBackup()]]]),
      asOf: '2026-12-25',
    })
    expect(events.some((e) => e.type === 'tatkalWindowOpenNow')).toBe(true)
  })

  it('emits waitlistMoved when WL improves between two history entries', () => {
    const events = buildDueTatkalNotificationEvents({
      plans: [
        makePlan({
          wlHistory: [
            { date: '2026-12-20', wlNumber: 40, status: 'Waiting List' },
            { date: '2026-12-22', wlNumber: 30, status: 'Waiting List' },
          ],
        }),
      ],
      backupsByPlanId: new Map(),
      asOf: '2026-12-22',
    })
    const moved = events.find((e) => e.type === 'waitlistMoved')
    expect(moved).toBeDefined()
    expect(moved?.body).toContain('40')
    expect(moved?.body).toContain('30')
  })

  it('emits backupDecisionDue when Tatkal opens tomorrow with no active backups', () => {
    const events = buildDueTatkalNotificationEvents({
      plans: [makePlan()],
      backupsByPlanId: new Map(),
      asOf: '2026-12-24',
    })
    expect(events.some((e) => e.type === 'backupDecisionDue')).toBe(true)
  })

  it('does not emit backupDecisionDue when active backups exist', () => {
    const events = buildDueTatkalNotificationEvents({
      plans: [makePlan()],
      backupsByPlanId: new Map([['p1', [makeBackup()]]]),
      asOf: '2026-12-24',
    })
    expect(events.some((e) => e.type === 'backupDecisionDue')).toBe(false)
  })

  it('emits bookingMissed when the Tatkal window has passed unconfirmed', () => {
    const events = buildDueTatkalNotificationEvents({
      plans: [makePlan({ journeyDate: '2026-12-20' })],
      backupsByPlanId: new Map(),
      asOf: '2026-12-25',
    })
    expect(events.some((e) => e.type === 'bookingMissed')).toBe(true)
  })

  it('emits highDemandAlert for Very High demand within 5 days of Tatkal opening', () => {
    const events = buildDueTatkalNotificationEvents({
      plans: [makePlan({ demand: 'Very High' })],
      backupsByPlanId: new Map([['p1', [makeBackup()]]]),
      asOf: '2026-12-22',
    })
    expect(events.some((e) => e.type === 'highDemandAlert')).toBe(true)
  })

  it('skips terminal-status plans entirely', () => {
    const events = buildDueTatkalNotificationEvents({
      plans: [makePlan({ status: 'Confirmed' })],
      backupsByPlanId: new Map(),
      asOf: '2026-12-25',
    })
    expect(events).toEqual([])
  })
})

describe('groupBackupsByPlan', () => {
  it('groups backups by their parent plan id', () => {
    const map = groupBackupsByPlan([
      makeBackup({ id: 'a', tatkalPlanId: 'p1' }),
      makeBackup({ id: 'b', tatkalPlanId: 'p2' }),
      makeBackup({ id: 'c', tatkalPlanId: 'p1' }),
    ])
    expect(map.get('p1')?.map((b) => b.id)).toEqual(['a', 'c'])
    expect(map.get('p2')?.map((b) => b.id)).toEqual(['b'])
  })
})