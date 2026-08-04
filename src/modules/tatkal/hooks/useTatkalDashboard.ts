import { useMemo } from 'react'
import { todayKey } from '@/utils/date'
import { useTatkalPlans } from './useTatkalPlans'
import { useBackupOptions } from './useBackupOptions'
import { useTrips } from '@/modules/trips/hooks/useTrips'
import { useTripBookings } from '@/modules/transport/hooks/useTripBookings'
import { bucketTatkalPlans } from '../lib/dashboardBuckets'
import { groupBackupsByPlan } from '../lib/notificationEvents'
import type { Trip } from '@/modules/trips/types/trip.types'
import type { TripBooking } from '@/modules/transport/types/transport.types'
import type { BackupOption, TatkalPlan } from '../types/tatkal.types'

export interface TatkalDashboardData {
  buckets: ReturnType<typeof bucketTatkalPlans>
  plans: TatkalPlan[]
  backups: BackupOption[]
  backupsByPlanId: Map<string, BackupOption[]>
  tripById: Map<string, Trip>
  bookingById: Map<string, TripBooking>
  todayCount: number
  tomorrowCount: number
  isLoading: boolean
}

/**
 * Wires `bucketTatkalPlans` to live useTatkalPlans/useTrips/useTripBookings
 * data so the Tatkal page and the main dashboard's alert card share one
 * derivation of "what needs attention today/tomorrow".
 */
export function useTatkalDashboard(): TatkalDashboardData {
  const { data: plans, isLoading: loadingPlans } = useTatkalPlans()
  const { data: backups, isLoading: loadingBackups } = useBackupOptions()
  const { data: trips, isLoading: loadingTrips } = useTrips()
  const { data: bookings, isLoading: loadingBookings } = useTripBookings()

  const today = todayKey()

  return useMemo(() => {
    const planList = plans ?? []
    const backupList = backups ?? []
    const buckets = bucketTatkalPlans(planList, today)
    const backupsByPlanId = groupBackupsByPlan(backupList)
    const tripById = new Map((trips ?? []).map((t) => [t.id, t]))
    const bookingById = new Map((bookings ?? []).map((b) => [b.id, b]))

    return {
      buckets,
      plans: planList,
      backups: backupList,
      backupsByPlanId,
      tripById,
      bookingById,
      todayCount: buckets.today.length,
      tomorrowCount: buckets.tomorrow.length,
      isLoading: loadingPlans || loadingBackups || loadingTrips || loadingBookings,
    }
  }, [plans, backups, trips, bookings, today, loadingPlans, loadingBackups, loadingTrips, loadingBookings])
}