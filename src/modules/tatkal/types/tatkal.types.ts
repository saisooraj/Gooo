import type { FirestoreDocument } from '@/types/firestore'
import type { DateKey } from '@/utils/date'
import type { BookingDemand } from '@/modules/transport/types/transport.types'
import type { TransportMode } from '@/modules/trips/types/trip.types'

/**
 * Lifecycle of a single train leg being tracked for Tatkal prep. The early
 * states cover ordinary advance-reservation planning; the later ones track the
 * Tatkal window itself once the regular booking lands on the waitlist.
 */
export type TatkalStatus =
  | 'Planning'
  | 'Reservation Pending'
  | 'Reserved Booked'
  | 'Waiting List'
  | 'RAC'
  | 'Confirmed'
  | 'Tatkal Planned'
  | 'Tatkal Booked'
  | 'Cancelled'
  | 'Completed'

/**
 * IRCTC opens AC Tatkal at 10:00 and Non-AC at 11:00 — the class drives which
 * opening time applies to a plan's countdown.
 */
export type TatkalClass = 'AC' | 'NonAC'

export interface WaitlistEntry {
  date: DateKey
  wlNumber?: number
  racNumber?: number
  status: TatkalStatus
}

export interface TatkalChecklist {
  passengerDetailsSaved: boolean
  preferredTrainSelected: boolean
  boardingStationVerified: boolean
  paymentMethodReady: boolean
  // backupTrainAdded / backupBusAdded / backupFlightAdded are DERIVED from
  // BackupOption[], not stored — see deriveChecklist() in lib/backupEngine.ts.
}

/** `tatkalPlans` collection — one per train leg being tracked for Tatkal prep. */
export interface TatkalPlan extends FirestoreDocument {
  tripId: string
  tripBookingId?: string
  boardingStation: string
  destinationStation: string
  journeyDate: DateKey
  reservationOpensOn: DateKey
  tatkalClass: TatkalClass
  status: TatkalStatus
  demand: BookingDemand
  currentWlNumber?: number
  currentRacNumber?: number
  wlHistory: WaitlistEntry[]
  checklist: TatkalChecklist
  notes?: string
}

export type BackupMode = 'Train' | 'Bus' | 'Flight'
export type BackupStatus = 'Suggested' | 'Added' | 'Booked' | 'Rejected'

/** `tatkalBackupOptions` collection — ranked fallback candidates for a plan. */
export interface BackupOption extends FirestoreDocument {
  tatkalPlanId: string
  priority: number
  mode: BackupMode
  boardingStation?: string
  destinationStation?: string
  trainNumber?: string
  trainName?: string
  operator?: string
  airline?: string
  flightNumber?: string
  status: BackupStatus
  isAutoSuggested: boolean
  notes?: string
}

/** `tatkalPreferences` collection — one document per user. */
export interface TatkalPreferences extends FirestoreDocument {
  enableTatkalPlanning: boolean
  defaultBookingWindowDays: number
  preferredBookingTime: string
  preferredPaymentMethod?: string
  preferredBoardingStations: string[]
  preferredDestinationStations: string[]
  defaultBackupTransport: TransportMode
  highDemandAlerts: boolean
  tatkalReminders: boolean
}