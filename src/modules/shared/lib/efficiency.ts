export interface EfficiencyResult {
  efficiency: number
  stars: 1 | 2 | 3 | 4 | 5
}

/**
 * Vacation efficiency = total days off / leave days actually spent.
 * Higher is better — it means weekends/holidays did more of the work.
 * Used by both the leaves module (dashboard "Vacation Efficiency" card) and
 * the recommendation engine, so it lives in `shared` rather than either.
 * Star thresholds follow the spec examples (4.0 -> 5★, 2.5 -> 4★, 2.25 -> 3★).
 */
export function computeEfficiency(vacationDays: number, leaveUsed: number): EfficiencyResult {
  if (leaveUsed <= 0) {
    return { efficiency: vacationDays > 0 ? Infinity : 0, stars: 5 }
  }
  const efficiency = vacationDays / leaveUsed
  let stars: EfficiencyResult['stars']
  if (efficiency >= 3.5) stars = 5
  else if (efficiency >= 2.5) stars = 4
  else if (efficiency >= 2.0) stars = 3
  else if (efficiency >= 1.5) stars = 2
  else stars = 1
  return { efficiency, stars }
}
