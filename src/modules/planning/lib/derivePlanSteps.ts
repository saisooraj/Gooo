import type { DateKey, WeekendConfig } from '@/utils/date'
import { classifyDateRange } from '@/modules/shared/lib/dayBreakdown'
import type { Trip } from '@/modules/trips/types/trip.types'
import type { TripBooking } from '@/modules/transport/types/transport.types'
import type { TatkalPlan } from '@/modules/tatkal/types/tatkal.types'

export interface PlanStep {
  id: string
  label: string
  done: boolean
}

export type PlanStatus = 'ACTIVE' | 'IN PROGRESS' | 'DRAFT'

export interface DerivedPlan {
  trip: Trip
  status: PlanStatus
  progress: number
  steps: PlanStep[]
}

/**
 * Derives a 3-step prep checklist for a trip from data that actually exists —
 * there's no "hotel shortlisted" equivalent anywhere in the data model, so
 * that mockup step is intentionally dropped rather than faked.
 */
export function derivePlanSteps(
  trip: Trip,
  bookings: TripBooking[],
  tatkalPlans: TatkalPlan[],
  holidayDates: ReadonlySet<DateKey>,
  weekend: WeekendConfig,
): DerivedPlan {
  const breakdown = classifyDateRange(trip.departureDate, trip.returnDate, holidayDates, weekend)

  // A trip that has moved past pure "Planning" status has had its leave locked
  // in; a trip that needs zero workdays off (fully within weekends/holidays)
  // never required leave in the first place.
  const leavePlanned = breakdown.workdays === 0 || trip.status !== 'Planning'
  const researched = bookings.length > 0 || tatkalPlans.length > 0
  const booked = trip.status === 'Booked' || trip.status === 'Completed' || bookings.some((b) => Boolean(b.bookedDate))

  const steps: PlanStep[] = [
    { id: 'leave', label: 'Leave planned', done: leavePlanned },
    { id: 'research', label: 'Train researched', done: researched },
    { id: 'booked', label: 'Tickets booked', done: booked },
  ]

  const doneCount = steps.filter((s) => s.done).length
  const progress = Math.round((doneCount / steps.length) * 100)
  const status: PlanStatus = doneCount === 0 ? 'DRAFT' : doneCount === steps.length ? 'ACTIVE' : 'IN PROGRESS'

  return { trip, status, progress, steps }
}
