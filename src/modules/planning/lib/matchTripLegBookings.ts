import { compareDateKeys, diffDays } from '@/utils/date'
import type { Trip } from '@/modules/trips/types/trip.types'
import type { TripBooking } from '@/modules/transport/types/transport.types'

export interface MatchedTripLegs {
  onward: TripBooking | null
  return: TripBooking | null
}

/**
 * Matches a trip's bookings to its onward/return legs by count and
 * chronological order rather than requiring an exact date match against
 * `trip.departureDate`/`returnDate` — a booking's journey date routinely
 * differs by a day or two from the trip's own dates (an overnight train,
 * a rough estimate when the trip was first planned), and exact matching
 * was producing phantom "still needs booking" reminders for legs that were
 * already booked.
 */
export function matchTripLegBookings(trip: Trip, tripBookings: TripBooking[]): MatchedTripLegs {
  if (tripBookings.length === 0) return { onward: null, return: null }

  if (tripBookings.length === 1) {
    const booking = tripBookings[0]
    if (!booking) return { onward: null, return: null }
    const distToDeparture = Math.abs(diffDays(booking.journeyDate, trip.departureDate))
    const distToReturn = Math.abs(diffDays(booking.journeyDate, trip.returnDate))
    return distToDeparture <= distToReturn
      ? { onward: booking, return: null }
      : { onward: null, return: booking }
  }

  const sorted = [...tripBookings].sort((a, b) => compareDateKeys(a.journeyDate, b.journeyDate))
  return { onward: sorted[0] ?? null, return: sorted[sorted.length - 1] ?? null }
}
