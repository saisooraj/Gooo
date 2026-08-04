import { useMemo } from 'react'
import {
  addDays,
  compareDateKeys,
  eachDateInRange,
  isWeekend,
  todayKey,
  WEEKEND_PRESETS,
} from '@/utils/date'
import type { DateKey } from '@/utils/date'
import { useHolidays } from '@/modules/holidays/hooks/useHolidays'
import { useTrips } from '@/modules/trips/hooks/useTrips'
import { useTripBookings } from '@/modules/transport/hooks/useTripBookings'
import { useSettings } from '@/modules/settings/hooks/useSettings'
import { useGeneratedRecommendations } from '@/modules/recommendations/hooks/useGeneratedRecommendations'
import { useTatkalPlans } from '@/modules/tatkal/hooks/useTatkalPlans'
import { computeBookingWindow } from '@/modules/transport/lib/bookingWindow'
import { DEFAULT_ADVANCE_RESERVATION_DAYS } from '@/constants/transport'

export type CalendarTag =
  | 'recommended'
  | 'holiday'
  | 'weekend'
  | 'bookingOpens'
  | 'trip'
  | 'tatkal'
  | 'past'

export function useCalendarData(year: number) {
  const { data: holidays } = useHolidays()
  const { data: trips } = useTrips()
  const { data: bookings } = useTripBookings()
  const { data: tatkalPlans } = useTatkalPlans()
  const { settings } = useSettings()
  const { recommendations } = useGeneratedRecommendations(year)

  const weekend = settings?.weekendDays ?? WEEKEND_PRESETS.SAT_SUN
  const today = todayKey()

  const tagsByDate = useMemo(() => {
    const map = new Map<DateKey, Set<CalendarTag>>()
    const tag = (date: DateKey, value: CalendarTag) => {
      if (!map.has(date)) map.set(date, new Set())
      map.get(date)?.add(value)
    }

    for (const holiday of holidays ?? []) tag(holiday.date, 'holiday')

    for (const trip of trips ?? []) {
      if (trip.status === 'Cancelled') continue
      for (const date of eachDateInRange(trip.departureDate, trip.returnDate)) tag(date, 'trip')
    }

    for (const recommendation of recommendations) {
      for (const date of eachDateInRange(recommendation.startDate, recommendation.endDate)) {
        tag(date, 'recommended')
      }
    }

    for (const booking of bookings ?? []) {
      const advanceDays = booking.train?.advanceReservationDays ?? DEFAULT_ADVANCE_RESERVATION_DAYS
      const window = computeBookingWindow(booking.journeyDate, advanceDays)
      tag(window.bookingOpensOn, 'bookingOpens')
    }

    for (const plan of tatkalPlans ?? []) {
      if (plan.status === 'Cancelled' || plan.status === 'Completed') continue
      // Tatkal window opens one day before the journey date.
      tag(addDays(plan.journeyDate, -1), 'tatkal')
    }

    return map
  }, [holidays, trips, recommendations, bookings, tatkalPlans])

  function getTags(date: DateKey): Set<CalendarTag> {
    const tags = new Set(tagsByDate.get(date) ?? [])
    if (isWeekend(date, weekend)) tags.add('weekend')
    if (compareDateKeys(date, today) < 0) tags.add('past')
    return tags
  }

  return { getTags }
}