import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Sheet } from '@/components/ui/Sheet'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { compareDateKeys, diffDaysInclusive, WEEKEND_PRESETS } from '@/utils/date'
import { useHolidays } from '@/modules/holidays/hooks/useHolidays'
import { useSettings } from '@/modules/settings/hooks/useSettings'
import { useTripBookings } from '@/modules/transport/hooks/useTripBookings'
import { classifyDateRange } from '@/modules/shared/lib/dayBreakdown'
import { useCreateTrip, useRemoveTrip, useTrips, useUpdateTrip } from '../hooks/useTrips'
import { TripCard } from './TripCard'
import { TripForm } from './TripForm'
import { TripStatusTabs, type TripTab } from './TripStatusTabs'
import type { TripFormValues } from '../lib/trip.schema'
import type { Trip } from '../types/trip.types'

export function TripsPage() {
  const { data: trips, isLoading: loadingTrips } = useTrips()
  const { data: bookings, isLoading: loadingBookings } = useTripBookings()
  const { data: holidays, isLoading: loadingHolidays } = useHolidays()
  const { settings } = useSettings()
  const createMutation = useCreateTrip()
  const updateMutation = useUpdateTrip()
  const removeMutation = useRemoveTrip()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Trip | null>(null)
  const [tab, setTab] = useState<TripTab>('upcoming')

  const isLoading = loadingTrips || loadingBookings || loadingHolidays

  const bookingsByTripId = useMemo(() => {
    const map = new Map<string, typeof bookings>()
    for (const booking of bookings ?? []) {
      const list = map.get(booking.tripId) ?? []
      list.push(booking)
      map.set(booking.tripId, list as NonNullable<typeof bookings>)
    }
    return map
  }, [bookings])

  const holidayDates = useMemo(() => new Set((holidays ?? []).map((h) => h.date)), [holidays])
  const weekend = settings?.weekendDays ?? WEEKEND_PRESETS.SAT_SUN

  function openCreate() {
    setEditing(null)
    setSheetOpen(true)
  }

  function openEdit(trip: Trip) {
    setEditing(trip)
    setSheetOpen(true)
  }

  async function handleSubmit(values: TripFormValues) {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data: values })
    } else {
      await createMutation.mutateAsync(values)
    }
    setSheetOpen(false)
  }

  async function handleDelete(trip: Trip) {
    if (window.confirm(`Delete "${trip.title}"?`)) {
      await removeMutation.mutateAsync(trip.id)
    }
  }

  const sorted = trips?.slice().sort((a, b) => compareDateKeys(a.departureDate, b.departureDate)) ?? []
  const filtered = sorted.filter((trip) => {
    if (tab === 'upcoming') return trip.status === 'Booked'
    if (tab === 'past') return trip.status === 'Completed' || trip.status === 'Cancelled'
    return trip.status === 'Planning'
  })

  return (
    <div className="mx-auto flex max-w-[780px] flex-col gap-[22px]">
      <PageHeader
        eyebrow="TRIPS"
        title="Your Trips"
        action={
          <Button onClick={openCreate} variant="secondary" size="sm">
            <Icon name="plus" className="h-4 w-4" />
            Log Trip
          </Button>
        }
      />

      <TripStatusTabs value={tab} onChange={setTab} />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : filtered.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {filtered.map((trip) => {
            const breakdown = classifyDateRange(
              trip.departureDate,
              trip.returnDate,
              holidayDates,
              weekend,
              new Set(trip.excludedLeaveDates ?? []),
            )
            return (
              <TripCard
                key={trip.id}
                trip={trip}
                bookings={bookingsByTripId.get(trip.id) ?? []}
                days={diffDaysInclusive(trip.departureDate, trip.returnDate)}
                leaveUsed={breakdown.workdays}
                onEdit={() => openEdit(trip)}
                onDelete={() => void handleDelete(trip)}
              />
            )
          })}
        </div>
      ) : (
        <EmptyState title="Nothing here yet" description="Start planning your next adventure" />
      )}

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editing ? 'Edit Trip' : 'Add Trip'}>
        <TripForm
          defaultValues={editing ?? undefined}
          holidayDates={holidayDates}
          weekend={weekend}
          onSubmit={(values) => void handleSubmit(values)}
          onCancel={() => setSheetOpen(false)}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </Sheet>
    </div>
  )
}
