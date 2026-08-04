import { useMemo } from 'react'
import { eachDateInRange, todayKey, WEEKEND_PRESETS } from '@/utils/date'
import { DEFAULT_ADVANCE_RESERVATION_DAYS } from '@/constants/transport'
import { computeRemainingBalance, monthsElapsedInYear } from '@/modules/leaves/lib/leaveCalculations'
import { useLeaveBalances } from '@/modules/leaves/hooks/useLeaveBalances'
import { useHolidays } from '@/modules/holidays/hooks/useHolidays'
import { useTrips } from '@/modules/trips/hooks/useTrips'
import { useSettings } from '@/modules/settings/hooks/useSettings'
import { createDeterministicRecommendationEngine } from '../lib/engine'
import type { VacationRecommendation } from '../types/recommendation.types'

const engine = createDeterministicRecommendationEngine()

/**
 * Wires the deterministic engine up to live Firestore data: leave balances
 * (how many days are available), holidays for the target year, existing
 * trips (excluded so we don't recommend over already-booked dates), and the
 * user's weekend/continuous-leave settings.
 */
export function useGeneratedRecommendations(year: number) {
  const { data: leaveBalances, isLoading: loadingLeaves } = useLeaveBalances()
  const { data: holidays, isLoading: loadingHolidays } = useHolidays()
  const { data: trips, isLoading: loadingTrips } = useTrips()
  const { settings, isLoading: loadingSettings } = useSettings()

  const isLoading = loadingLeaves || loadingHolidays || loadingTrips || loadingSettings

  const recommendations = useMemo<VacationRecommendation[]>(() => {
    if (isLoading) return []

    const availableLeaveDays = (leaveBalances ?? [])
      .filter((balance) => balance.year === year)
      .reduce(
        (sum, balance) =>
          sum +
          computeRemainingBalance({
            openingBalance: balance.openingBalance,
            monthlyCredit: balance.monthlyCredit,
            monthsElapsed: monthsElapsedInYear(balance.year, todayKey()),
            leaveUsed: balance.leaveUsed,
            carryForward: balance.carryForward,
          }),
        0,
      )

    const excludedDates = (trips ?? [])
      .filter((trip) => trip.status !== 'Cancelled')
      .flatMap((trip) => eachDateInRange(trip.departureDate, trip.returnDate))

    return engine.generate({
      year,
      availableLeaveDays: Math.max(0, Math.floor(availableLeaveDays)),
      holidays: (holidays ?? [])
        .filter((holiday) => holiday.date.startsWith(String(year)))
        .map((holiday) => ({ date: holiday.date, name: holiday.name, isMandatory: holiday.isMandatory })),
      weekend: settings?.weekendDays ?? WEEKEND_PRESETS.SAT_SUN,
      preferences: { maxContinuousLeaveDays: settings?.maxContinuousLeaveDays ?? 4 },
      excludedDates,
      advanceReservationDays: DEFAULT_ADVANCE_RESERVATION_DAYS,
    })
  }, [isLoading, leaveBalances, holidays, trips, settings, year])

  return { recommendations, isLoading }
}
