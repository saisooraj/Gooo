import { describe, expect, it } from 'vitest'
import {
  checklistProgress,
  deriveChecklist,
  rankBackupOptions,
  suggestBackupActions,
} from './backupEngine'
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
    reservationOpensOn: '2026-10-27',
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

describe('rankBackupOptions', () => {
  it('sorts by priority ascending', () => {
    const ranked = rankBackupOptions([
      makeBackup({ id: 'a', priority: 3 }),
      makeBackup({ id: 'b', priority: 1 }),
      makeBackup({ id: 'c', priority: 2 }),
    ])
    expect(ranked.map((o) => o.id)).toEqual(['b', 'c', 'a'])
  })

  it('sinks rejected options to the bottom regardless of priority', () => {
    const ranked = rankBackupOptions([
      makeBackup({ id: 'a', priority: 5, status: 'Rejected' }),
      makeBackup({ id: 'b', priority: 2, status: 'Added' }),
    ])
    expect(ranked.map((o) => o.id)).toEqual(['b', 'a'])
  })
})

describe('suggestBackupActions', () => {
  it('returns nothing for a confirmed plan', () => {
    const s = suggestBackupActions({
      plan: makePlan({ status: 'Confirmed' }),
      existingBackups: [],
      preferredBoardingStations: [],
      preferredDestinationStations: [],
      defaultBackupTransport: 'Bus',
    })
    expect(s).toEqual([])
  })

  it('suggests alternate-date trains when no train backup exists', () => {
    const s = suggestBackupActions({
      plan: makePlan(),
      existingBackups: [],
      preferredBoardingStations: [],
      preferredDestinationStations: [],
      defaultBackupTransport: 'Train',
    })
    const trainSuggestions = s.filter((x) => x.mode === 'Train')
    expect(trainSuggestions.length).toBeGreaterThanOrEqual(2)
    expect(trainSuggestions.some((x) => x.alternateDate === '2026-12-25')).toBe(true)
    expect(trainSuggestions.some((x) => x.alternateDate === '2026-12-27')).toBe(true)
  })

  it('suggests bus and flight when those modes are missing', () => {
    const s = suggestBackupActions({
      plan: makePlan(),
      existingBackups: [makeBackup({ mode: 'Train' })],
      preferredBoardingStations: [],
      preferredDestinationStations: [],
      defaultBackupTransport: 'Train',
    })
    expect(s.some((x) => x.mode === 'Bus')).toBe(true)
    expect(s.some((x) => x.mode === 'Flight')).toBe(true)
    expect(s.some((x) => x.mode === 'Train')).toBe(false)
  })

  it('surfaces preferred default backup transport first when missing', () => {
    const s = suggestBackupActions({
      plan: makePlan(),
      existingBackups: [makeBackup({ mode: 'Train' })],
      preferredBoardingStations: [],
      preferredDestinationStations: [],
      defaultBackupTransport: 'Bus',
    })
    expect(s[0]?.mode).toBe('Bus')
  })

  it('suggests nearby stations from preferences', () => {
    const s = suggestBackupActions({
      plan: makePlan(),
      existingBackups: [],
      preferredBoardingStations: ['Whitefield'],
      preferredDestinationStations: ['Aluva'],
      defaultBackupTransport: 'Train',
    })
    const nearby = s.find((x) => x.nearbyBoardingStation === 'Whitefield')
    expect(nearby).toBeDefined()
    expect(nearby?.nearbyDestinationStation).toBe('Aluva')
  })

  it('does not suggest modes already covered by active backups', () => {
    const s = suggestBackupActions({
      plan: makePlan(),
      existingBackups: [
        makeBackup({ mode: 'Train' }),
        makeBackup({ mode: 'Bus' }),
        makeBackup({ mode: 'Flight' }),
      ],
      preferredBoardingStations: [],
      preferredDestinationStations: [],
      defaultBackupTransport: 'Train',
    })
    expect(s).toEqual([])
  })

  it('ignores rejected backups when computing covered modes', () => {
    const s = suggestBackupActions({
      plan: makePlan(),
      existingBackups: [makeBackup({ mode: 'Train', status: 'Rejected' })],
      preferredBoardingStations: [],
      preferredDestinationStations: [],
      defaultBackupTransport: 'Train',
    })
    expect(s.some((x) => x.mode === 'Train')).toBe(true)
  })
})

describe('deriveChecklist', () => {
  it('derives backup flags from active backups', () => {
    const d = deriveChecklist(makePlan(), [
      makeBackup({ mode: 'Train' }),
      makeBackup({ mode: 'Bus', status: 'Rejected' }),
      makeBackup({ mode: 'Flight' }),
    ])
    expect(d.backupTrainAdded).toBe(true)
    expect(d.backupBusAdded).toBe(false)
    expect(d.backupFlightAdded).toBe(true)
  })

  it('preserves stored checklist toggles', () => {
    const d = deriveChecklist(
      makePlan({
        checklist: {
          passengerDetailsSaved: true,
          preferredTrainSelected: true,
          boardingStationVerified: false,
          paymentMethodReady: true,
        },
      }),
      [],
    )
    expect(d.passengerDetailsSaved).toBe(true)
    expect(d.preferredTrainSelected).toBe(true)
    expect(d.boardingStationVerified).toBe(false)
    expect(d.paymentMethodReady).toBe(true)
  })
})

describe('checklistProgress', () => {
  it('counts completed items', () => {
    const d = deriveChecklist(
      makePlan({
        checklist: {
          passengerDetailsSaved: true,
          preferredTrainSelected: true,
          boardingStationVerified: false,
          paymentMethodReady: false,
        },
      }),
      [makeBackup({ mode: 'Train' })],
    )
    const p = checklistProgress(d)
    expect(p).toEqual({ done: 3, total: 7 })
  })

  it('reports full progress when everything is done', () => {
    const d = deriveChecklist(
      makePlan({
        checklist: {
          passengerDetailsSaved: true,
          preferredTrainSelected: true,
          boardingStationVerified: true,
          paymentMethodReady: true,
        },
      }),
      [
        makeBackup({ mode: 'Train' }),
        makeBackup({ mode: 'Bus' }),
        makeBackup({ mode: 'Flight' }),
      ],
    )
    expect(checklistProgress(d)).toEqual({ done: 7, total: 7 })
  })
})