import type { BookingDemand } from '@/modules/transport/types/transport.types'

export type BookingTiming = 'early' | 'on-time' | 'late'

export interface ConfidenceInput {
  demand: BookingDemand
  timing: BookingTiming
  isWeekend: boolean
  isHoliday: boolean
  isFestival: boolean
  /** Current waitlist number, if any (undefined = not on waitlist). */
  wlNumber?: number
}

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface BookingConfidence {
  /** 0–100 numeric score. */
  score: number
  level: ConfidenceLevel
}

const DEMAND_PENALTY: Record<BookingDemand, number> = {
  Low: 0,
  Medium: 10,
  High: 25,
  'Very High': 40,
}

const TIMING_PENALTY: Record<BookingTiming, number> = {
  early: 0,
  'on-time': 5,
  late: 20,
}

/**
 * Deterministic booking-confidence heuristic. Starts from a baseline of 100
 * and subtracts penalties for demand, timing, weekend/holiday/festival
 * pressure, and waitlist depth. The result is clamped to [0, 100] and bucketed
 * into high/medium/low. Intentionally simple and easy to replace with a real
 * model later — no fabricated data is involved.
 */
export function computeBookingConfidence(input: ConfidenceInput): BookingConfidence {
  let score = 100
  score -= DEMAND_PENALTY[input.demand]
  score -= TIMING_PENALTY[input.timing]
  if (input.isWeekend) score -= 5
  if (input.isHoliday) score -= 10
  if (input.isFestival) score -= 15
  if (typeof input.wlNumber === 'number' && input.wlNumber > 0) {
    // Each WL position reduces confidence, with diminishing impact.
    score -= Math.min(30, input.wlNumber * 3)
  }

  score = Math.max(0, Math.min(100, score))

  let level: ConfidenceLevel
  if (score >= 70) level = 'high'
  else if (score >= 40) level = 'medium'
  else level = 'low'

  return { score, level }
}