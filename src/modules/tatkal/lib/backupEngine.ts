import { addDays, subtractDays } from '@/utils/date'
import type { DateKey } from '@/utils/date'
import type { TransportMode } from '@/modules/trips/types/trip.types'
import type {
  BackupMode,
  BackupOption,
  TatkalChecklist,
  TatkalPlan,
} from '../types/tatkal.types'

/**
 * Sorts backup options by their `priority` field (1 = first choice). Ties keep
 * their relative input order (stable sort). Rejected options sink to the
 * bottom regardless of priority so the active fallbacks surface first.
 */
export function rankBackupOptions(options: BackupOption[]): BackupOption[] {
  const rejectedWeight = (o: BackupOption) => (o.status === 'Rejected' ? 1 : 0)
  return [...options].sort((a, b) => {
    const r = rejectedWeight(a) - rejectedWeight(b)
    if (r !== 0) return r
    return a.priority - b.priority
  })
}

export interface BackupSuggestion {
  mode: BackupMode
  reason: string
  /** Suggested alternate journey date (±1 day from the original). */
  alternateDate?: DateKey
  /** Nearby boarding station from preferences, if any. */
  nearbyBoardingStation?: string
  /** Nearby destination station from preferences, if any. */
  nearbyDestinationStation?: string
  isAutoSuggested: true
}

export interface SuggestBackupActionsInput {
  plan: TatkalPlan
  existingBackups: BackupOption[]
  preferredBoardingStations: string[]
  preferredDestinationStations: string[]
  defaultBackupTransport: TransportMode
}

/**
 * Deterministic Backup Recommendation Engine + Emergency Planner + Booking
 * Strategy, collapsed into one pure rule function. It never fabricates train
 * numbers or schedules — it only suggests *modes*, *alternate dates* (±1 day),
 * and *nearby stations* drawn from the user's preferences, plus flags any
 * transport mode not yet covered by an existing backup.
 *
 * Suggestions are only emitted for plans that are still in play (not
 * Cancelled/Completed/Confirmed).
 */
export function suggestBackupActions(input: SuggestBackupActionsInput): BackupSuggestion[] {
  const { plan, existingBackups, preferredBoardingStations, preferredDestinationStations, defaultBackupTransport } =
    input

  if (
    plan.status === 'Cancelled' ||
    plan.status === 'Completed' ||
    plan.status === 'Confirmed' ||
    plan.status === 'Tatkal Booked' ||
    plan.status === 'Reserved Booked'
  ) {
    return []
  }

  const suggestions: BackupSuggestion[] = []
  const coveredModes = new Set(existingBackups.filter((o) => o.status !== 'Rejected').map((o) => o.mode))

  // 1. Alternate-date train suggestion (±1 day) — the classic Tatkal fallback.
  if (!coveredModes.has('Train')) {
    suggestions.push({
      mode: 'Train',
      reason: 'Try the same route a day before or after — Tatkal/General quotas reopen.',
      alternateDate: subtractDays(plan.journeyDate, 1),
      isAutoSuggested: true,
    })
    suggestions.push({
      mode: 'Train',
      reason: 'Try the same route a day after — Tatkal/General quotas reopen.',
      alternateDate: addDays(plan.journeyDate, 1),
      isAutoSuggested: true,
    })
  }

  // 2. Nearby boarding station suggestion (from preferences).
  const nearbyBoarding = preferredBoardingStations.find(
    (s) => s.length > 0 && s.toLowerCase() !== plan.boardingStation.toLowerCase(),
  )
  const nearbyDestination = preferredDestinationStations.find(
    (s) => s.length > 0 && s.toLowerCase() !== plan.destinationStation.toLowerCase(),
  )
  if (nearbyBoarding || nearbyDestination) {
    if (!coveredModes.has('Train')) {
      suggestions.push({
        mode: 'Train',
        reason: 'Try a nearby boarding/destination station from your preferences.',
        nearbyBoardingStation: nearbyBoarding,
        nearbyDestinationStation: nearbyDestination,
        isAutoSuggested: true,
      })
    }
  }

  // 3. Missing-mode fallbacks: bus and flight, unless already covered.
  const fallbackModes: BackupMode[] = ['Bus', 'Flight']
  for (const mode of fallbackModes) {
    if (!coveredModes.has(mode)) {
      suggestions.push({
        mode,
        reason: `No ${mode.toLowerCase()} backup yet — add one as a non-train fallback.`,
        isAutoSuggested: true,
      })
    }
  }

  // 4. Default backup transport from preferences, surfaced first if missing.
  if (defaultBackupTransport !== 'Train' && !coveredModes.has(defaultBackupTransport as BackupMode)) {
    const mode = defaultBackupTransport as BackupMode
    if (!suggestions.some((s) => s.mode === mode)) {
      suggestions.unshift({
        mode,
        reason: 'Your preferred default backup transport.',
        isAutoSuggested: true,
      })
    }
  }

  return suggestions
}

/**
 * Derives the backup-related checklist items from the BackupOption[] (the spec
 * says these are never stored). Returns a merged checklist combining the
 * plan's stored toggles with the derived backup flags.
 */
export function deriveChecklist(plan: TatkalPlan, backups: BackupOption[]): TatkalChecklist & {
  backupTrainAdded: boolean
  backupBusAdded: boolean
  backupFlightAdded: boolean
} {
  const active = backups.filter((b) => b.status !== 'Rejected')
  return {
    ...plan.checklist,
    backupTrainAdded: active.some((b) => b.mode === 'Train'),
    backupBusAdded: active.some((b) => b.mode === 'Bus'),
    backupFlightAdded: active.some((b) => b.mode === 'Flight'),
  }
}

/** Counts completed checklist items (stored + derived) for progress UI. */
export function checklistProgress(
  derived: ReturnType<typeof deriveChecklist>,
): { done: number; total: number } {
  const items = [
    derived.passengerDetailsSaved,
    derived.preferredTrainSelected,
    derived.boardingStationVerified,
    derived.paymentMethodReady,
    derived.backupTrainAdded,
    derived.backupBusAdded,
    derived.backupFlightAdded,
  ]
  return { done: items.filter(Boolean).length, total: items.length }
}