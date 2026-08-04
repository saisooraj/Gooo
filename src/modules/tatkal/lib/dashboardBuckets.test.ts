import { describe, expect, it } from 'vitest'
import { bucketTatkalPlans } from './dashboardBuckets'
import type { TatkalPlan } from '../types/tatkal.types'

function makePlan(
  journeyDate: string,
  status: TatkalPlan['status'] = 'Waiting List',
  updatedAt = '2026-12-20T00:00:00.000Z',
): TatkalPlan {
  return {
    id: `plan-${journeyDate}-${status}`,
    userId: 'u1',
    createdAt: '',
    updatedAt,
    tripId: 't1',
    boardingStation: 'A',
    destinationStation: 'B',
    journeyDate,
    reservationOpensOn: journeyDate,
    tatkalClass: 'AC',
    status,
    demand: 'High',
    wlHistory: [],
    checklist: {
      passengerDetailsSaved: false,
      preferredTrainSelected: false,
      boardingStationVerified: false,
      paymentMethodReady: false,
    },
  } as TatkalPlan
}

describe('bucketTatkalPlans', () => {
  it('puts a plan whose Tatkal window opens today into "today"', () => {
    // journey 2026-12-26 → tatkal opens 2026-12-25
    const b = bucketTatkalPlans([makePlan('2026-12-26')], '2026-12-25')
    expect(b.today).toHaveLength(1)
    expect(b.tomorrow).toHaveLength(0)
  })

  it('puts a plan whose Tatkal window opens tomorrow into "tomorrow"', () => {
    const b = bucketTatkalPlans([makePlan('2026-12-26')], '2026-12-24')
    expect(b.tomorrow).toHaveLength(1)
    expect(b.today).toHaveLength(0)
  })

  it('puts a plan opening within the week (after tomorrow) into "upcoming"', () => {
    const b = bucketTatkalPlans([makePlan('2026-12-30')], '2026-12-25')
    // tatkal opens 2026-12-29, which is 4 days out → upcoming
    expect(b.upcoming).toHaveLength(1)
  })

  it('puts an unconfirmed plan whose window has passed into "missed"', () => {
    const b = bucketTatkalPlans([makePlan('2026-12-20')], '2026-12-25')
    // tatkal opened 2026-12-19, now passed, still Waiting List → missed
    expect(b.missed).toHaveLength(1)
  })

  it('puts a recently confirmed plan into "recentlyConfirmed"', () => {
    const b = bucketTatkalPlans(
      [makePlan('2026-12-26', 'Confirmed', '2026-12-22T00:00:00.000Z')],
      '2026-12-25',
    )
    expect(b.recentlyConfirmed).toHaveLength(1)
    expect(b.today).toHaveLength(0)
  })

  it('excludes a confirmed plan older than 7 days from recentlyConfirmed', () => {
    const b = bucketTatkalPlans(
      [makePlan('2026-12-26', 'Confirmed', '2026-12-10T00:00:00.000Z')],
      '2026-12-25',
    )
    expect(b.recentlyConfirmed).toHaveLength(0)
  })

  it('excludes cancelled and completed plans entirely', () => {
    const b = bucketTatkalPlans(
      [makePlan('2026-12-26', 'Cancelled'), makePlan('2026-12-26', 'Completed')],
      '2026-12-25',
    )
    expect(b.today).toHaveLength(0)
    expect(b.recentlyConfirmed).toHaveLength(0)
    expect(b.missed).toHaveLength(0)
  })

  it('sorts each bucket by journey date ascending', () => {
    // Both plans have Tatkal windows that already passed (missed bucket),
    // so we can verify multi-item sorting within one bucket.
    const b = bucketTatkalPlans(
      [makePlan('2026-12-18'), makePlan('2026-12-15')],
      '2026-12-25',
    )
    expect(b.missed.map((p) => p.journeyDate)).toEqual(['2026-12-15', '2026-12-18'])
  })
})