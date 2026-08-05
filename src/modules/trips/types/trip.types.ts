import type { FirestoreDocument } from '@/types/firestore'
import type { DateKey } from '@/utils/date'

export type TripStatus = 'Planning' | 'Booked' | 'Completed' | 'Cancelled'
export type TransportMode = 'Train' | 'Flight' | 'Bus'

/** `trips` collection. */
export interface Trip extends FirestoreDocument {
  title: string
  purpose?: string
  origin: string
  destination: string
  departureDate: DateKey
  returnDate: DateKey
  mode: TransportMode
  status: TripStatus
  estimatedBudget?: number
  actualBudget?: number
  notes?: string
  recommendationId?: string
  /** Workdays within [departureDate, returnDate] that did NOT actually require leave (e.g. an evening departure after work). */
  excludedLeaveDates?: DateKey[]
}
