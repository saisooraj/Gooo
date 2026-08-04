import type { WaitlistEntry } from '../types/tatkal.types'

export type ConfirmationTrend = 'improving' | 'stable' | 'worsening' | 'unknown'

export interface ConfirmationChance {
  /** 0–100 estimated probability of confirmation. */
  chance: number
  trend: ConfirmationTrend
}

/**
 * Estimates the probability of a waitlisted ticket being confirmed, based on
 * the movement trend of its WL history. Pure and deterministic — it only
 * looks at the sequence of recorded WL/RAC numbers, never at fabricated data.
 *
 * Rules:
 *  - No history → unknown trend, neutral 50%.
 *  - Already RAC → higher baseline (70%) than pure WL.
 *  - WL number decreasing over time → improving trend, chance boosted.
 *  - WL number increasing → worsening trend, chance reduced.
 *  - Fewer days until journey with high WL → lower chance.
 */
export function estimateConfirmationChance(
  history: WaitlistEntry[],
  daysUntilJourney: number,
): ConfirmationChance {
  if (history.length === 0) {
    return { chance: 50, trend: 'unknown' }
  }

  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date))
  const latest = sorted[sorted.length - 1]

  // Already confirmed or RAC.
  if (latest?.status === 'Confirmed') return { chance: 100, trend: 'improving' }
  if (latest?.status === 'RAC') return { chance: 70, trend: 'improving' }
  if (latest?.status === 'Cancelled' || latest?.status === 'Completed') {
    return { chance: 0, trend: 'stable' }
  }

  const wlValues = sorted
    .map((e) => e.wlNumber)
    .filter((v): v is number => typeof v === 'number')

  if (wlValues.length === 0) {
    return { chance: 50, trend: 'unknown' }
  }

  const first = wlValues[0] as number
  const last = wlValues[wlValues.length - 1] as number
  const delta = first - last // positive = improving (WL shrinking)

  let trend: ConfirmationTrend
  if (delta > 0) trend = 'improving'
  else if (delta < 0) trend = 'worsening'
  else trend = 'stable'

  // Baseline from current WL: lower WL → higher chance.
  let chance = Math.max(5, 80 - last * 4)

  // Adjust for trend.
  if (trend === 'improving') chance += 10
  else if (trend === 'worsening') chance -= 15

  // Less time remaining with a high WL reduces odds.
  if (daysUntilJourney <= 1 && last > 10) chance -= 20
  else if (daysUntilJourney <= 3 && last > 20) chance -= 10

  chance = Math.max(0, Math.min(100, chance))
  return { chance, trend }
}