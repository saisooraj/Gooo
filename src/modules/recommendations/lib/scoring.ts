export interface ScoreInput {
  vacationLength: number
  leaveUsed: number
  efficiency: number
  preferredTripDuration?: number
}

/** Leave blocks longer than this many consecutive days start incurring a penalty. */
export const LONG_LEAVE_PENALTY_THRESHOLD = 3
const LONG_LEAVE_PENALTY_PER_DAY = 15
const PREFERENCE_MATCH_BONUS = 10

/**
 * Ranks recommendations for sorting/display. Efficiency dominates the
 * score; continuous leave beyond the penalty threshold is discouraged;
 * matching the user's preferred trip length gives a small nudge up.
 * Deterministic — same inputs always produce the same score.
 */
export function computeScore(input: ScoreInput): number {
  const baseEfficiency = Number.isFinite(input.efficiency) ? input.efficiency : 10
  let score = baseEfficiency * 25

  if (input.leaveUsed > LONG_LEAVE_PENALTY_THRESHOLD) {
    score -= (input.leaveUsed - LONG_LEAVE_PENALTY_THRESHOLD) * LONG_LEAVE_PENALTY_PER_DAY
  }

  if (input.preferredTripDuration) {
    const distance = Math.abs(input.vacationLength - input.preferredTripDuration)
    score += Math.max(0, PREFERENCE_MATCH_BONUS - distance * 2)
  }

  return Math.max(0, Math.round(score * 100) / 100)
}
