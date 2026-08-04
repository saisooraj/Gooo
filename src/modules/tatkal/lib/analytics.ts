import { isBefore, todayKey } from '@/utils/date'
import type { DateKey } from '@/utils/date'
import type { BackupOption, TatkalPlan } from '../types/tatkal.types'

export interface TatkalAnalytics {
  totalPlans: number
  /** Plans that reached a confirmed state (Confirmed/Tatkal Booked/Reserved Booked). */
  confirmedCount: number
  /** Plans still in an unconfirmed, non-terminal state with a future journey. */
  pendingCount: number
  /** Plans whose Tatkal window passed without confirmation (journey date past, still pending). */
  missedCount: number
  /** Plans cancelled by the user. */
  cancelledCount: number
  /** Confirmed / (Confirmed + Missed) — success rate of the Tatkal strategy. */
  successRate: number
  /** Average current WL across plans that are on the waitlist. */
  averageCurrentWl: number
  /** Total WL history entries recorded across all plans. */
  totalWlHistoryEntries: number
  /** Plans that have at least one backup option. */
  plansWithBackups: number
  /** Total backup options across all plans. */
  totalBackups: number
  /** Backup options that were actually booked. */
  backupsBooked: number
  /** Backup options auto-suggested vs user-added. */
  autoSuggestedBackups: number
}

const CONFIRMED = new Set<TatkalPlan['status']>(['Confirmed', 'Tatkal Booked', 'Reserved Booked'])
const TERMINAL = new Set<TatkalPlan['status']>(['Cancelled', 'Completed'])

/**
 * Pure aggregation over a user's Tatkal plans and backup options. Deterministic
 * — given the same inputs (and `asOf` date) it always returns the same result.
 * Used by the Analytics page's Tatkal section.
 */
export function computeTatkalAnalytics(
  plans: TatkalPlan[],
  backups: BackupOption[],
  asOf: DateKey = todayKey(),
): TatkalAnalytics {
  const totalPlans = plans.length
  let confirmedCount = 0
  let pendingCount = 0
  let missedCount = 0
  let cancelledCount = 0
  let wlSum = 0
  let wlCount = 0
  let totalWlHistoryEntries = 0

  for (const plan of plans) {
    if (CONFIRMED.has(plan.status)) {
      confirmedCount++
    } else if (TERMINAL.has(plan.status)) {
      cancelledCount++
    } else if (isBefore(plan.journeyDate, asOf)) {
      // Journey date has passed but the plan never confirmed → missed.
      missedCount++
    } else {
      pendingCount++
    }

    if (typeof plan.currentWlNumber === 'number' && plan.currentWlNumber > 0) {
      wlSum += plan.currentWlNumber
      wlCount++
    }
    totalWlHistoryEntries += plan.wlHistory.length
  }

  const backupsByPlan = new Map<string, BackupOption[]>()
  for (const b of backups) {
    const list = backupsByPlan.get(b.tatkalPlanId) ?? []
    list.push(b)
    backupsByPlan.set(b.tatkalPlanId, list)
  }

  let plansWithBackups = 0
  for (const plan of plans) {
    if ((backupsByPlan.get(plan.id) ?? []).length > 0) plansWithBackups++
  }

  const totalBackups = backups.length
  const backupsBooked = backups.filter((b) => b.status === 'Booked').length
  const autoSuggestedBackups = backups.filter((b) => b.isAutoSuggested).length

  const successRate =
    confirmedCount + missedCount > 0
      ? (confirmedCount / (confirmedCount + missedCount)) * 100
      : 0

  return {
    totalPlans,
    confirmedCount,
    pendingCount,
    missedCount,
    cancelledCount,
    successRate,
    averageCurrentWl: wlCount > 0 ? wlSum / wlCount : 0,
    totalWlHistoryEntries,
    plansWithBackups,
    totalBackups,
    backupsBooked,
    autoSuggestedBackups,
  }
}