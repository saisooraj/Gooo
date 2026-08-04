import type { DateKey } from '@/utils/date'
import type { TatkalClass } from './tatkal.types'

/**
 * INTERFACES ONLY — never implemented or instantiated in V1.
 *
 * These describe the contracts a future external-integration layer (IRCTC
 * APIs, PNR status, fare prediction, real push delivery, calendar sync) would
 * fill. They are typed here so call sites can already be written against them
 * and so the module's boundaries are explicit; matching the existing
 * no-op notificationDispatcher precedent, no concrete adapters are wired up.
 */

/** A read-only IRCTC-style booking client (search, fare, availability). */
export interface IrctcApiClient {
  searchTrains(input: {
    boardingStation: string
    destinationStation: string
    journeyDate: DateKey
    tatkalClass: TatkalClass
  }): Promise<IrctcTrainResult[]>
}

export interface IrctcTrainResult {
  trainNumber: string
  trainName: string
  boardingStation: string
  destinationStation: string
  departureTime: string
  arrivalTime: string
  availableClasses: TatkalClass[]
}

/** Live PNR status lookup (current WL/RAC/Confirmed position). */
export interface PnrStatusProvider {
  getStatus(pnr: string): Promise<PnrStatus>
}

export interface PnrStatus {
  pnr: string
  status: 'Confirmed' | 'RAC' | 'Waiting List' | 'Cancelled'
  currentWlNumber?: number
  currentRacNumber?: number
  coach?: string
  seat?: string
  updatedAt: string
}

/** Real-time seat availability for a train/class/date/quota combination. */
export interface SeatAvailabilityProvider {
  getAvailability(input: {
    trainNumber: string
    journeyDate: DateKey
    tatkalClass: TatkalClass
    quota: 'General' | 'Tatkal' | 'Premium Tatkal'
  }): Promise<SeatAvailability>
}

export interface SeatAvailability {
  available: number
  waitlist: number
  rac: number
  status: 'AVAILABLE' | 'RAC' | 'WL' | 'NOT AVAILABLE'
}

/** Predicts fare for a route/class/date — useful for backup cost comparison. */
export interface FarePredictionProvider {
  predictFare(input: {
    boardingStation: string
    destinationStation: string
    tatkalClass: TatkalClass
    journeyDate: DateKey
  }): Promise<FarePrediction>
}

export interface FarePrediction {
  estimatedFare: number
  currency: string
  confidence: 'low' | 'medium' | 'high'
}

/** Aggregates historical Tatkal booking success rates by route/class/time. */
export interface TatkalSuccessAnalyticsProvider {
  getSuccessRate(input: {
    boardingStation: string
    destinationStation: string
    tatkalClass: TatkalClass
    journeyDate: DateKey
  }): Promise<TatkalSuccessRate>
}

export interface TatkalSuccessRate {
  successRate: number
  sampleSize: number
  averageBookingTimeSeconds: number
}

/**
 * Real push notification delivery. V1 uses the app-wide no-op
 * notificationDispatcher; this interface documents what a real Tatkal push
 * provider would look like so the notificationEvents layer can target it.
 */
export interface PushNotificationProvider {
  send(userId: string, payload: TatkalPushPayload): Promise<void>
}

export interface TatkalPushPayload {
  title: string
  body: string
  tatkalPlanId: string
  scheduledFor: string
}

/** Two-way calendar sync (Google/Outlook) for Tatkal windows and journey dates. */
export interface CalendarSyncProvider {
  sync(userId: string, events: CalendarSyncEvent[]): Promise<void>
}

export interface CalendarSyncEvent {
  title: string
  start: string
  end: string
  description?: string
}