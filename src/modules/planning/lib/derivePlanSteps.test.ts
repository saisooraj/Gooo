import { describe, expect, it } from 'vitest'
import { WEEKEND_PRESETS } from '@/utils/date'
import { derivePlanSteps } from './derivePlanSteps'
import type { Trip } from '@/modules/trips/types/trip.types'
import type { TripBooking } from '@/modules/transport/types/transport.types'
import type { TatkalPlan } from '@/modules/tatkal/types/tatkal.types'

function trip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: 't1',
    userId: 'u1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    title: 'Gandhi Jayanti Escape',
    origin: 'Delhi',
    destination: 'Jaipur',
    departureDate: '2026-10-01',
    returnDate: '2026-10-04',
    mode: 'Train',
    status: 'Planning',
    ...overrides,
  }
}

function booking(overrides: Partial<TripBooking> = {}): TripBooking {
  return {
    id: 'b1',
    userId: 'u1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    tripId: 't1',
    mode: 'Train',
    journeyDate: '2026-10-01',
    bookedDate: null,
    ...overrides,
  }
}

function tatkalPlan(overrides: Partial<TatkalPlan> = {}): TatkalPlan {
  return {
    id: 'tk1',
    userId: 'u1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    tripId: 't1',
    boardingStation: 'NDLS',
    destinationStation: 'JP',
    journeyDate: '2026-10-01',
    reservationOpensOn: '2026-09-30',
    tatkalClass: 'AC',
    status: 'Planning',
    demand: 'Medium',
    wlHistory: [],
    checklist: {
      passengerDetailsSaved: false,
      preferredTrainSelected: false,
      boardingStationVerified: false,
      paymentMethodReady: false,
    },
    ...overrides,
  }
}

const NO_HOLIDAYS = new Set<string>()

describe('derivePlanSteps', () => {
  it('is a full DRAFT when nothing has happened yet and leave is still required', () => {
    const result = derivePlanSteps(trip(), [], [], NO_HOLIDAYS, WEEKEND_PRESETS.SAT_SUN)
    expect(result.steps.find((s) => s.id === 'leave')?.done).toBe(false)
    expect(result.steps.find((s) => s.id === 'research')?.done).toBe(false)
    expect(result.steps.find((s) => s.id === 'booked')?.done).toBe(false)
    expect(result.status).toBe('DRAFT')
    expect(result.progress).toBe(0)
  })

  it('marks leave planned once the trip moves out of Planning status', () => {
    const result = derivePlanSteps(trip({ status: 'Booked' }), [], [], NO_HOLIDAYS, WEEKEND_PRESETS.SAT_SUN)
    expect(result.steps.find((s) => s.id === 'leave')?.done).toBe(true)
  })

  it('marks leave planned when the trip needs zero workdays off', () => {
    // A Sat–Sun trip costs zero leave regardless of trip status.
    const result = derivePlanSteps(
      trip({ departureDate: '2026-10-03', returnDate: '2026-10-04', status: 'Planning' }),
      [],
      [],
      NO_HOLIDAYS,
      WEEKEND_PRESETS.SAT_SUN,
    )
    expect(result.steps.find((s) => s.id === 'leave')?.done).toBe(true)
  })

  it('marks leave planned when every workday in the span is explicitly excluded', () => {
    // Mon-Wed trip, but the only workdays are both marked as not needing leave.
    const result = derivePlanSteps(
      trip({
        departureDate: '2026-10-01',
        returnDate: '2026-10-02',
        status: 'Planning',
        excludedLeaveDates: ['2026-10-01', '2026-10-02'],
      }),
      [],
      [],
      NO_HOLIDAYS,
      WEEKEND_PRESETS.SAT_SUN,
    )
    expect(result.steps.find((s) => s.id === 'leave')?.done).toBe(true)
  })

  it('marks research done when either a booking or a tatkal plan exists', () => {
    expect(derivePlanSteps(trip(), [booking()], [], NO_HOLIDAYS, WEEKEND_PRESETS.SAT_SUN).steps.find((s) => s.id === 'research')?.done).toBe(true)
    expect(derivePlanSteps(trip(), [], [tatkalPlan()], NO_HOLIDAYS, WEEKEND_PRESETS.SAT_SUN).steps.find((s) => s.id === 'research')?.done).toBe(true)
  })

  it('marks booked done when a booking has a bookedDate or the trip status is Booked', () => {
    expect(
      derivePlanSteps(trip(), [booking({ bookedDate: '2026-08-01' })], [], NO_HOLIDAYS, WEEKEND_PRESETS.SAT_SUN).steps.find(
        (s) => s.id === 'booked',
      )?.done,
    ).toBe(true)
    expect(
      derivePlanSteps(trip({ status: 'Booked' }), [], [], NO_HOLIDAYS, WEEKEND_PRESETS.SAT_SUN).steps.find((s) => s.id === 'booked')
        ?.done,
    ).toBe(true)
  })

  it('is ACTIVE once every step is done', () => {
    const result = derivePlanSteps(
      trip({ status: 'Booked' }),
      [booking({ bookedDate: '2026-08-01' })],
      [],
      NO_HOLIDAYS,
      WEEKEND_PRESETS.SAT_SUN,
    )
    expect(result.status).toBe('ACTIVE')
    expect(result.progress).toBe(100)
  })

  it('is IN PROGRESS with partial completion', () => {
    // Booked (leave + booked done) but no booking/tatkal plan linked yet (research not done) = 2/3.
    const result = derivePlanSteps(trip({ status: 'Booked' }), [], [], NO_HOLIDAYS, WEEKEND_PRESETS.SAT_SUN)
    expect(result.status).toBe('IN PROGRESS')
    expect(result.progress).toBe(67)
  })
})
