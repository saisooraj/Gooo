import type { FirestoreDocument } from '@/types/firestore'
import type { DateKey } from '@/utils/date'
import type { TransportMode } from '@/modules/trips/types/trip.types'

export type TrainQuota =
  | 'General'
  | 'Tatkal'
  | 'Premium Tatkal'
  | 'Ladies'
  | 'Senior Citizen'
  | 'Divyaang'

export type BookingDemand = 'Low' | 'Medium' | 'High' | 'Very High'

/** Only Train carries real planning logic in V1 — Flight/Bus are informational. */
export interface TrainDetails {
  trainNumber: string
  trainName: string
  boardingStation: string
  destinationStation: string
  quota: TrainQuota
  coach?: string
  seat?: string
  pnr?: string
  /** Advance reservation period, in days, used to derive the booking-open date. */
  advanceReservationDays: number
  /** 1 (lowest) – 5 (highest); influences reminder urgency alongside demand. */
  priority: 1 | 2 | 3 | 4 | 5
  demand: BookingDemand
}

export interface FlightDetails {
  airline?: string
  flightNumber?: string
  notes?: string
}

export interface BusDetails {
  operator?: string
  busNumber?: string
  notes?: string
}

/** `tripBookings` collection. */
export interface TripBooking extends FirestoreDocument {
  tripId: string
  mode: TransportMode
  journeyDate: DateKey
  bookedDate: DateKey | null
  train?: TrainDetails
  flight?: FlightDetails
  bus?: BusDetails
}

export interface BookingWindow {
  bookingOpensOn: DateKey
  bookingClosesOn: DateKey
  daysUntilOpen: number
  status: 'upcoming' | 'open-book-today' | 'open' | 'closed' | 'missed'
}
