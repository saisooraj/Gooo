import { addDays, compareDateKeys, formatDisplay, todayKey } from '@/utils/date'
import type { DateKey } from '@/utils/date'
import { cn } from '@/utils/cn'
import type { TatkalPlan } from '../types/tatkal.types'

interface Stage {
  label: string
  date: DateKey
  /** Whether this stage has been reached as of today. */
  reached: boolean
}

/**
 * Vertical lifecycle timeline: Reservation Opens → Tatkal Window Opens →
 * Journey Starts. Purely derived from the plan's dates and today's date.
 */
export function TatkalStageTimeline({ plan }: { plan: TatkalPlan }) {
  const today = todayKey()
  const tatkalOpensOn = addDays(plan.journeyDate, -1)

  const stages: Stage[] = [
    {
      label: 'Reservation opens',
      date: plan.reservationOpensOn,
      reached: compareDateKeys(plan.reservationOpensOn, today) <= 0,
    },
    {
      label: 'Tatkal window opens',
      date: tatkalOpensOn,
      reached: compareDateKeys(tatkalOpensOn, today) <= 0,
    },
    {
      label: 'Trip starts',
      date: plan.journeyDate,
      reached: compareDateKeys(plan.journeyDate, today) <= 0,
    },
  ]

  return (
    <ol className="relative ml-3 border-l border-white/10">
      {stages.map((stage) => (
        <li key={stage.label} className="mb-3 ml-4 last:mb-0">
          <span
            className={cn(
              'absolute -left-[5px] mt-1 h-2.5 w-2.5 rounded-full ring-2 ring-s1',
              stage.reached ? 'bg-purple' : 'bg-white/20',
            )}
          />
          <p className="text-xs font-medium text-t1">{stage.label}</p>
          <p className="text-xs text-t2">{formatDisplay(stage.date)}</p>
        </li>
      ))}
    </ol>
  )
}