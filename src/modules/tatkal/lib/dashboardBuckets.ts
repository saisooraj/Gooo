import { compareDateKeys, todayKey } from '@/utils/date'
import type { DateKey } from '@/utils/date'
import { addDays } from '@/utils/date'
import type { TatkalPlan } from '../types/tatkal.types'

export type TatkalBucket =
  | 'today'
  | 'tomorrow'
  | 'upcoming'
  | 'missed'
  | 'recentlyConfirmed'

export interface BucketedTatkalPlans {
  today: TatkalPlan[]
  tomorrow: TatkalPlan[]
  upcoming: TatkalPlan[]
  missed: TatkalPlan[]
  recentlyConfirmed: TatkalPlan[]
}

const TERMINAL_STATUSES = new Set<TatkalPlan['status']>(['Cancelled', 'Completed'])
const CONFIRMED_STATUSES = new Set<TatkalPlan['status']>(['Confirmed', 'Tatkal Booked', 'Reserved Booked'])

/**
 * Buckets plans for the Tatkal dashboard. Bucketing is by the Tatkal opening
 * date (journeyDate − 1), not the journey date itself, since the dashboard's
 * purpose is to surface *action needed now*:
 *
 *  - today:      Tatkal window opens today (action required immediately).
 *  - tomorrow:   Tatkal window opens tomorrow (prep tonight).
 *  - upcoming:   Tatkal window opens within the next week (after tomorrow).
 *  - missed:     Tatkal window has passed and the plan is still unconfirmed.
 *  - recentlyConfirmed: plan moved to a confirmed status in the last 7 days.
 *
 * Cancelled/Completed plans are excluded entirely.
 */
export function bucketTatkalPlans(
  plans: TatkalPlan[],
  asOf: DateKey = todayKey(),
): BucketedTatkalPlans {
  const tomorrow = addDays(asOf, 1)
  const weekOut = addDays(asOf, 7)
  const weekAgo = addDays(asOf, -7)

  const buckets: BucketedTatkalPlans = {
    today: [],
    tomorrow: [],
    upcoming: [],
    missed: [],
    recentlyConfirmed: [],
  }

  for (const plan of plans) {
    if (TERMINAL_STATUSES.has(plan.status)) continue

    // Recently confirmed: confirmed within the last 7 days (by updatedAt).
    if (CONFIRMED_STATUSES.has(plan.status)) {
      if (compareDateKeys(plan.updatedAt.slice(0, 10), weekAgo) >= 0) {
        buckets.recentlyConfirmed.push(plan)
      }
      continue
    }

    // For unconfirmed plans, bucket by the Tatkal opening date.
    const tatkalOpensOn = addDays(plan.journeyDate, -1)
    const cmp = compareDateKeys(tatkalOpensOn, asOf)

    if (cmp === 0) {
      buckets.today.push(plan)
    } else if (compareDateKeys(tatkalOpensOn, tomorrow) === 0) {
      buckets.tomorrow.push(plan)
    } else if (cmp > 0 && compareDateKeys(tatkalOpensOn, weekOut) <= 0) {
      buckets.upcoming.push(plan)
    } else if (cmp < 0) {
      // Opening date has passed and the plan is still unconfirmed → missed.
      buckets.missed.push(plan)
    }
  }

  // Sort each bucket by journey date ascending.
  const sortByJourney = (a: TatkalPlan, b: TatkalPlan) =>
    compareDateKeys(a.journeyDate, b.journeyDate)
  buckets.today.sort(sortByJourney)
  buckets.tomorrow.sort(sortByJourney)
  buckets.upcoming.sort(sortByJourney)
  buckets.missed.sort(sortByJourney)
  buckets.recentlyConfirmed.sort(sortByJourney)

  return buckets
}