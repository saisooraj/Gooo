import dayjs from 'dayjs'
import { diffDays, formatDisplay, isAfter, subtractDays, todayKey } from '@/utils/date'
import type { DateKey } from '@/utils/date'
import type { TatkalClass } from '../types/tatkal.types'
import { TATKAL_OPEN_TIME, TATKAL_OPENS_DAYS_BEFORE_JOURNEY } from './irctcRules'

export interface TatkalWindow {
  journeyDate: DateKey
  tatkalClass: TatkalClass
  /** Date the Tatkal window opens (1 day before journey). */
  tatkalOpensOn: DateKey
  /** 'HH:mm' opening time for the class (10:00 AC / 11:00 Non-AC). */
  tatkalOpensAt: string
  /** Full ISO timestamp of the opening moment — used for time-precise countdown. */
  tatkalOpensAtIso: string
  /** Whole days from `asOf` to `tatkalOpensOn`. */
  daysUntilTatkal: number
  status: 'far' | 'upcoming' | 'tomorrow' | 'today' | 'open' | 'passed'
}

/**
 * Computes the Tatkal booking window for a journey. Pure function of its
 * inputs — the date-level status is deterministic and identical for every
 * user. Time-of-day precision (the "Opens in Nh / Nm" ladder) is resolved
 * separately by `getTatkalCountdownLabel` when a `now` timestamp is supplied.
 */
export function computeTatkalWindow(
  journeyDate: DateKey,
  tatkalClass: TatkalClass,
  asOf: DateKey = todayKey(),
): TatkalWindow {
  const tatkalOpensOn = subtractDays(journeyDate, TATKAL_OPENS_DAYS_BEFORE_JOURNEY)
  const tatkalOpensAt = TATKAL_OPEN_TIME[tatkalClass]
  const tatkalOpensAtIso = `${tatkalOpensOn}T${tatkalOpensAt}:00`
  const daysUntilTatkal = diffDays(asOf, tatkalOpensOn)

  let status: TatkalWindow['status']
  if (isAfter(asOf, journeyDate)) {
    // Journey day has passed — the Tatkal window is over.
    status = 'passed'
  } else if (isAfter(asOf, tatkalOpensOn)) {
    // asOf === journeyDate (since tatkalOpensOn = journeyDate − 1): the Tatkal
    // window opened yesterday and is still available on the journey day.
    status = 'open'
  } else if (daysUntilTatkal === 0) {
    status = 'today'
  } else if (daysUntilTatkal === 1) {
    status = 'tomorrow'
  } else if (daysUntilTatkal <= 5) {
    status = 'upcoming'
  } else {
    status = 'far'
  }

  return { journeyDate, tatkalClass, tatkalOpensOn, tatkalOpensAt, tatkalOpensAtIso, daysUntilTatkal, status }
}

/**
 * Human-readable countdown label following the spec's urgency ladder:
 * far → "Opens in Nd" → "Opens tomorrow" → "Opens today" → "Opens in Nh" →
 * "Opens in Nm" → "Open now" → "Tatkal open" / "Window passed".
 *
 * When `now` is omitted the label is date-level only; when supplied, the
 * 'today' status resolves to hour/minute precision.
 */
export function getTatkalCountdownLabel(window: TatkalWindow, now?: Date): string {
  switch (window.status) {
    case 'far':
      return `Opens ${formatDisplay(window.tatkalOpensOn)}`
    case 'upcoming':
      return `Opens in ${window.daysUntilTatkal}d`
    case 'tomorrow':
      return 'Opens tomorrow'
    case 'today': {
      if (!now) return 'Opens today'
      const opening = dayjs(window.tatkalOpensAtIso)
      const current = dayjs(now)
      const diffMs = opening.diff(current)
      if (diffMs <= 0) return 'Open now'
      const diffMin = Math.floor(diffMs / 60_000)
      const diffHr = Math.floor(diffMin / 60)
      if (diffHr >= 1) return `Opens in ${diffHr}h`
      return `Opens in ${diffMin}m`
    }
    case 'open':
      return 'Tatkal open'
    case 'passed':
      return 'Window passed'
  }
}