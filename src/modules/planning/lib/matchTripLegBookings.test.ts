import { describe, expect, it } from 'vitest'
import { matchTripLegBookings } from './matchTripLegBookings'
import type { Trip } from '@/modules/trips/types/trip.types'
import type { TripBooking } from '@/modules/transport/types/transport.types'

function trip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: 't1',
    userId: 'u1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    title: 'Vijaya Dashami Kerala Trip',
    origin: 'Bengaluru',
    destination: 'Kozhikode',
    departureDate: '2026-10-20',
    returnDate: '2026-10-25',
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
    journeyDate: '2026-10-20',
    bookedDate: null,
    ...overrides,
  }
}

describe('matchTripLegBookings', () => {
  it('returns nothing covered when there are no bookings', () => {
    expect(matchTripLegBookings(trip(), [])).toEqual({ onward: null, return: null })
  })

  it('matches two bookings to onward/return by chronological order, regardless of exact date alignment', () => {
    // Real-world case: trip dates are Oct 20 - 25, but the actual bookings are Oct 21 and Oct 25 —
    // an exact-date match would miss the onward leg entirely.
    const onwardBooking = booking({ id: 'onward', journeyDate: '2026-10-21' })
    const returnBooking = booking({ id: 'return', journeyDate: '2026-10-25' })
    const result = matchTripLegBookings(trip(), [returnBooking, onwardBooking])
    expect(result.onward?.id).toBe('onward')
    expect(result.return?.id).toBe('return')
  })

  it('assigns a single booking to whichever leg its date is closer to', () => {
    const nearDeparture = booking({ id: 'b', journeyDate: '2026-10-21' })
    expect(matchTripLegBookings(trip(), [nearDeparture])).toEqual({ onward: nearDeparture, return: null })

    const nearReturn = booking({ id: 'b', journeyDate: '2026-10-24' })
    expect(matchTripLegBookings(trip(), [nearReturn])).toEqual({ onward: null, return: nearReturn })
  })

  it('ties go to onward', () => {
    // Oct 20 - Oct 24 span: Oct 22 sits exactly equidistant from both ends.
    const midpoint = booking({ id: 'b', journeyDate: '2026-10-22' })
    const result = matchTripLegBookings(trip({ returnDate: '2026-10-24' }), [midpoint])
    expect(result.onward?.id).toBe('b')
    expect(result.return).toBeNull()
  })
})
