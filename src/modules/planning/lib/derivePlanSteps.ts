import type { DateKey, WeekendConfig } from '@/utils/date'
import { classifyDateRange } from '@/modules/shared/lib/dayBreakdown'
import type { Trip } from '@/modules/trips/types/trip.types'
import type { TripBooking } from '@/modules/transport/types/transport.types'
import type { TatkalPlan } from '@/modules/tatkal/types/tatkal.types'
import { matchTripLegBookings } from './matchTripLegBookings'

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
  /** Whether any TatkalPlan is linked to this trip — drives the "TATKAL" badge on PlanCard. */
  hasTatkalPlan: boolean
}

/**
 * Derives a prep checklist for a trip from data that actually exists —
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
  const breakdown = classifyDateRange(
    trip.departureDate,
    trip.returnDate,
    holidayDates,
    weekend,
    new Set(trip.excludedLeaveDates ?? []),
  )

  // Leave has no approval workflow in this app — the user confirms it themselves.
  // A trip that needs zero workdays off never required leave in the first place,
  // and a trip that's moved past pure "Planning" has necessarily had it sorted.
  const leavePlanned = breakdown.workdays === 0 || Boolean(trip.leaveConfirmed) || trip.status !== 'Planning'
  const researched = bookings.length > 0 || tatkalPlans.length > 0
  const tripBooked = trip.status === 'Booked' || trip.status === 'Completed'

  const steps: PlanStep[] = [{ id: 'leave', label: 'Leave planned', done: leavePlanned }]

  if (trip.departureDate !== trip.returnDate) {
    const { onward, return: ret } = matchTripLegBookings(trip, bookings)
    steps.push(
      { id: 'research', label: 'Train researched', done: researched },
      { id: 'booked-onward', label: 'Onward ticket booked', done: tripBooked || Boolean(onward?.bookedDate) },
      { id: 'booked-return', label: 'Return ticket booked', done: tripBooked || Boolean(ret?.bookedDate) },
    )
  } else {
    const booked = tripBooked || bookings.some((b) => Boolean(b.bookedDate))
    steps.push(
      { id: 'research', label: 'Train researched', done: researched },
      { id: 'booked', label: 'Tickets booked', done: booked },
    )
  }

  const doneCount = steps.filter((s) => s.done).length
  const progress = Math.round((doneCount / steps.length) * 100)
  const status: PlanStatus = doneCount === 0 ? 'DRAFT' : doneCount === steps.length ? 'ACTIVE' : 'IN PROGRESS'

  return { trip, status, progress, steps, hasTatkalPlan: tatkalPlans.length > 0 }
}
