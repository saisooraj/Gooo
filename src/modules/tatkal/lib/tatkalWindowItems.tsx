import { addDays, diffDays, formatDisplay } from '@/utils/date'
import type { DateKey } from '@/utils/date'
import type { TimelineItem } from '@/components/ui/Timeline'
import type { Trip } from '@/modules/trips/types/trip.types'
import type { TatkalPlan } from '../types/tatkal.types'
import { TATKAL_OPEN_TIME } from './irctcRules'

/**
 * Builds a Timeline row for a Tatkal plan's upcoming window — shared by the
 * Tatkal page's "Upcoming Windows" panel and the dashboard's "Bookings Due"
 * section so both read the same countdown for the same plan.
 */
export function buildTatkalWindowItem(plan: TatkalPlan, trip: Trip | undefined, today: DateKey): TimelineItem {
  const opensOn = addDays(plan.journeyDate, -1)
  const daysUntil = diffDays(today, opensOn)
  return {
    id: plan.id,
    color: '#C4A6FF',
    dateBox: { month: formatDisplay(opensOn, 'MMM').toUpperCase(), day: formatDisplay(opensOn, 'D') },
    label: (
      <span className="flex items-center gap-2">
        <span>{trip?.title ?? `${plan.boardingStation} → ${plan.destinationStation}`}</span>
        <span className="rounded bg-purple/10 px-[6px] py-0.5 font-mono text-[9px] font-bold tracking-[0.5px] text-purple">
          TATKAL
        </span>
      </span>
    ),
    sub: (
      <>
        {plan.boardingStation} → {plan.destinationStation}
        <br />
        <span className="font-sans text-[11.5px] font-semibold text-orange">
          {daysUntil <= 0 ? 'Opens today' : `${daysUntil} day${daysUntil === 1 ? '' : 's'} away`} ·{' '}
          {TATKAL_OPEN_TIME[plan.tatkalClass]}
        </span>
      </>
    ),
  }
}
