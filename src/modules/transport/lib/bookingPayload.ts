import type { TripBookingFormValues } from './tripBooking.schema'
import type { NewDocument } from '@/types/firestore'
import type { TripBooking } from '../types/transport.types'

/** Maps the flat booking form shape to the discriminated train/flight/bus payload Firestore stores. */
export function toBookingPayload(values: TripBookingFormValues): NewDocument<TripBooking> {
  const { tripId, mode, journeyDate, bookedDate, ...rest } = values
  return {
    tripId,
    mode,
    journeyDate,
    bookedDate: bookedDate || null,
    ...(mode === 'Train'
      ? {
          train: {
            trainNumber: rest.trainNumber ?? '',
            trainName: rest.trainName ?? '',
            boardingStation: rest.boardingStation ?? '',
            destinationStation: rest.destinationStation ?? '',
            quota: rest.quota ?? 'General',
            coach: rest.coach,
            seat: rest.seat,
            pnr: rest.pnr,
            advanceReservationDays: rest.advanceReservationDays,
            priority: rest.priority as 1 | 2 | 3 | 4 | 5,
            demand: rest.demand,
          },
        }
      : mode === 'Flight'
        ? { flight: { airline: rest.airline, flightNumber: rest.flightNumber, notes: rest.notes } }
        : { bus: { operator: rest.operator, busNumber: rest.busNumber, notes: rest.notes } }),
  }
}

/** Flattens a stored booking's discriminated union back into the form's flat default values. */
export function flattenBookingForEdit(booking: TripBooking) {
  return {
    tripId: booking.tripId,
    mode: booking.mode,
    journeyDate: booking.journeyDate,
    bookedDate: booking.bookedDate ?? undefined,
    ...booking.train,
    airline: booking.flight?.airline,
    flightNumber: booking.flight?.flightNumber,
    operator: booking.bus?.operator,
    busNumber: booking.bus?.busNumber,
    notes: booking.flight?.notes ?? booking.bus?.notes,
  }
}
