import type { FirestoreDocument } from '@/types/firestore'
import type { WeekdayIndex } from '@/utils/date'
import type { TransportMode } from '@/modules/trips/types/trip.types'

/** `tripPreferences` collection — one document per user. */
export interface TripPreferences extends FirestoreDocument {
  homeCity: string
  homeStation?: string
  preferredDestination?: string
  preferredBoardingStation?: string
  preferredTransport: TransportMode
  bookingWindowDays: number
  preferredTripLengthDays: number
  weekendTravelPreference: boolean
  preferredReturnDay: WeekdayIndex
  country: string
  timezone: string
}

/** `settings` collection — app-level user settings (weekend definition, etc.). */
export interface UserSettings extends FirestoreDocument {
  weekendDays: WeekdayIndex[]
  maxContinuousLeaveDays: number
}
