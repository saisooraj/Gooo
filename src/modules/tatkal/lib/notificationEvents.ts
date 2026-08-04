import { diffDays, todayKey } from '@/utils/date'
import type { DateKey } from '@/utils/date'
import type { BackupOption, TatkalPlan } from '../types/tatkal.types'
import { computeTatkalWindow } from './tatkalWindow'

/**
 * The seven Tatkal notification events from the spec. This union is pure data
 * — it is NOT wired to notificationDispatcher.dispatch() anywhere, matching
 * the existing no-op notificationDispatcher precedent. A future real push
 * provider (see integrations.types.ts) would consume these.
 */
export type TatkalNotificationEventType =
  | 'reservationOpensSoon'
  | 'tatkalWindowOpensSoon'
  | 'tatkalWindowOpenNow'
  | 'waitlistMoved'
  | 'backupDecisionDue'
  | 'bookingMissed'
  | 'highDemandAlert'

export interface TatkalNotificationEvent {
  type: TatkalNotificationEventType
  tatkalPlanId: string
  title: string
  body: string
  /** The date this event becomes relevant (for scheduling/dedup). */
  dueOn: DateKey
}

export interface BuildNotificationEventsInput {
  plans: TatkalPlan[]
  backupsByPlanId: Map<string, BackupOption[]>
  asOf?: DateKey
}

const TERMINAL = new Set<TatkalPlan['status']>(['Cancelled', 'Completed', 'Confirmed', 'Tatkal Booked', 'Reserved Booked'])

/**
 * Purely computes which of the 7 spec'd Tatkal notification events are due for
 * a set of plans, as of a given date. Deterministic — no side effects, no
 * dispatch. Each plan can emit multiple events.
 */
export function buildDueTatkalNotificationEvents(
  input: BuildNotificationEventsInput,
): TatkalNotificationEvent[] {
  const asOf = input.asOf ?? todayKey()
  const events: TatkalNotificationEvent[] = []

  for (const plan of input.plans) {
    if (TERMINAL.has(plan.status)) continue
    const backups = input.backupsByPlanId.get(plan.id) ?? []

    const window = computeTatkalWindow(plan.journeyDate, plan.tatkalClass, asOf)
    const daysUntilTatkal = window.daysUntilTatkal
    const daysUntilReservation = diffDays(asOf, plan.reservationOpensOn)

    // 1. reservationOpensSoon — advance reservation opening within 3 days.
    if (daysUntilReservation >= 0 && daysUntilReservation <= 3) {
      events.push({
        type: 'reservationOpensSoon',
        tatkalPlanId: plan.id,
        title: 'Reservation opens soon',
        body: `${plan.boardingStation} → ${plan.destinationStation} reservations open on ${plan.reservationOpensOn}.`,
        dueOn: asOf,
      })
    }

    // 2. tatkalWindowOpensSoon — Tatkal window opens within 2 days (tomorrow/day-after).
    if (daysUntilTatkal >= 1 && daysUntilTatkal <= 2) {
      events.push({
        type: 'tatkalWindowOpensSoon',
        tatkalPlanId: plan.id,
        title: 'Tatkal window opens soon',
        body: `Tatkal for ${plan.journeyDate} opens on ${window.tatkalOpensOn} at ${window.tatkalOpensAt}.`,
        dueOn: asOf,
      })
    }

    // 3. tatkalWindowOpenNow — the Tatkal window is open today.
    if (window.status === 'today' || window.status === 'open') {
      events.push({
        type: 'tatkalWindowOpenNow',
        tatkalPlanId: plan.id,
        title: 'Tatkal window is open',
        body: `Book now: Tatkal for ${plan.boardingStation} → ${plan.destinationStation} on ${plan.journeyDate}.`,
        dueOn: asOf,
      })
    }

    // 4. waitlistMoved — WL history has ≥2 entries and the latest WL is lower than the previous.
    if (plan.wlHistory.length >= 2) {
      const sorted = [...plan.wlHistory].sort((a, b) => a.date.localeCompare(b.date))
      const prev = sorted[sorted.length - 2]
      const latest = sorted[sorted.length - 1]
      if (
        typeof prev?.wlNumber === 'number' &&
        typeof latest?.wlNumber === 'number' &&
        latest.wlNumber < prev.wlNumber
      ) {
        events.push({
          type: 'waitlistMoved',
          tatkalPlanId: plan.id,
          title: 'Waitlist moved',
          body: `WL improved from ${prev.wlNumber} to ${latest.wlNumber} for ${plan.journeyDate}.`,
          dueOn: latest.date,
        })
      }
    }

    // 5. backupDecisionDue — Tatkal opens tomorrow and no active backups exist.
    if (daysUntilTatkal === 1) {
      const activeBackups = backups.filter((b) => b.status !== 'Rejected')
      if (activeBackups.length === 0) {
        events.push({
          type: 'backupDecisionDue',
          tatkalPlanId: plan.id,
          title: 'Backup decision due',
          body: `Tatkal opens tomorrow and you have no backup options for ${plan.journeyDate}.`,
          dueOn: asOf,
        })
      }
    }

    // 6. bookingMissed — Tatkal window passed and still unconfirmed.
    if (window.status === 'passed') {
      events.push({
        type: 'bookingMissed',
        tatkalPlanId: plan.id,
        title: 'Tatkal booking missed',
        body: `The Tatkal window for ${plan.journeyDate} has passed without confirmation.`,
        dueOn: asOf,
      })
    }

    // 7. highDemandAlert — Very High demand and Tatkal opens within 5 days.
    if (plan.demand === 'Very High' && daysUntilTatkal >= 0 && daysUntilTatkal <= 5) {
      events.push({
        type: 'highDemandAlert',
        tatkalPlanId: plan.id,
        title: 'High demand alert',
        body: `Very high demand on ${plan.journeyDate} — prepare backups and book the moment Tatkal opens.`,
        dueOn: asOf,
      })
    }
  }

  return events
}

/** Convenience: groups backups by their parent plan id. */
export function groupBackupsByPlan(backups: BackupOption[]): Map<string, BackupOption[]> {
  const map = new Map<string, BackupOption[]>()
  for (const b of backups) {
    const list = map.get(b.tatkalPlanId) ?? []
    list.push(b)
    map.set(b.tatkalPlanId, list)
  }
  return map
}

