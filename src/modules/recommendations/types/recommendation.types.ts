import type { FirestoreDocument } from '@/types/firestore'
import type { DateKey, WeekendConfig } from '@/utils/date'

export type StarRating = 1 | 2 | 3 | 4 | 5

/** A deterministic vacation suggestion produced by the recommendation engine. */
export interface VacationRecommendation {
  name: string
  startDate: DateKey
  endDate: DateKey
  leaveDatesUsed: DateKey[]
  holidayDatesUsed: DateKey[]
  weekendDatesUsed: DateKey[]
  vacationLength: number
  leaveUsed: number
  efficiency: number
  score: number
  stars: StarRating
  bookingDate: DateKey | null
  returnBookingDate: DateKey | null
  reason: string
}

/** `recommendations` collection — a persisted, user-facing recommendation. */
export interface RecommendationDocument extends FirestoreDocument, VacationRecommendation {
  year: number
  dismissed: boolean
  convertedToTripId?: string
}

export interface EngineHoliday {
  date: DateKey
  name: string
  isMandatory: boolean
}

export interface RecommendationPreferences {
  /** Preferred number of total days off for a vacation block (informational weighting). */
  preferredTripDuration?: number
  preferredDepartureDay?: WeekendConfig[number]
  preferredReturnDay?: WeekendConfig[number]
  /** Leave days beyond this length within one continuous block are penalized. */
  maxContinuousLeaveDays: number
}

export interface RecommendationEngineInput {
  year: number
  availableLeaveDays: number
  holidays: EngineHoliday[]
  weekend: WeekendConfig
  preferences: RecommendationPreferences
  /** Days already booked/taken as leave or trips, excluded from new suggestions. */
  excludedDates: DateKey[]
  /** Advance reservation period used to compute booking dates, in days. */
  advanceReservationDays: number
}

/**
 * Core contract for turning raw calendar inputs into ranked recommendations.
 * The default implementation (`lib/engine.ts`) is 100% deterministic: same
 * input always produces the same output, with no AI involved. A future AI
 * layer can implement this same interface (e.g. to re-rank or personalize)
 * without any caller code changing.
 */
export interface RecommendationEngine {
  generate(input: RecommendationEngineInput): VacationRecommendation[]
}

/**
 * Separates *why a recommendation scored the way it did* (deterministic,
 * always available) from *how it's explained to the user* (can be replaced
 * by an AI layer later). AI must only explain — it never calculates.
 */
export interface RecommendationExplainer {
  explain(recommendation: VacationRecommendation): string
}
