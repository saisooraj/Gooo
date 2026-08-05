import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Icon } from '@/components/ui/Icon'
import { Sheet } from '@/components/ui/Sheet'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { WEEKEND_PRESETS } from '@/utils/date'
import { useTrips, useCreateTrip, useUpdateTrip, useRemoveTrip } from '@/modules/trips/hooks/useTrips'
import { TripForm } from '@/modules/trips/components/TripForm'
import type { TripFormValues } from '@/modules/trips/lib/trip.schema'
import type { Trip } from '@/modules/trips/types/trip.types'
import { useTripBookings } from '@/modules/transport/hooks/useTripBookings'
import { useTatkalPlans } from '@/modules/tatkal/hooks/useTatkalPlans'
import { useHolidays } from '@/modules/holidays/hooks/useHolidays'
import { useSettings } from '@/modules/settings/hooks/useSettings'
import { derivePlanSteps } from '../lib/derivePlanSteps'
import { PlanCard } from './PlanCard'

export function PlanningPage() {
  const { data: trips, isLoading: loadingTrips } = useTrips()
  const { data: bookings, isLoading: loadingBookings } = useTripBookings()
  const { data: tatkalPlans, isLoading: loadingTatkal } = useTatkalPlans()
  const { data: holidays, isLoading: loadingHolidays } = useHolidays()
  const { settings } = useSettings()
  const createMutation = useCreateTrip()
  const updateMutation = useUpdateTrip()
  const removeMutation = useRemoveTrip()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Trip | null>(null)

  const isLoading = loadingTrips || loadingBookings || loadingTatkal || loadingHolidays

  const holidayDates = useMemo(() => new Set((holidays ?? []).map((h) => h.date)), [holidays])
  const weekend = settings?.weekendDays ?? WEEKEND_PRESETS.SAT_SUN

  const plans = useMemo(() => {
    const activeTrips = (trips ?? []).filter((t) => t.status === 'Planning' || t.status === 'Booked')
    return activeTrips.map((trip) =>
      derivePlanSteps(
        trip,
        (bookings ?? []).filter((b) => b.tripId === trip.id),
        (tatkalPlans ?? []).filter((p) => p.tripId === trip.id),
        holidayDates,
        weekend,
      ),
    )
  }, [trips, bookings, tatkalPlans, holidayDates, weekend])

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

  return (
    <div className="mx-auto flex max-w-[1020px] flex-col gap-6">
      <PageHeader
        eyebrow="WORKSPACE"
        title="Planning"
        action={
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-[9px] bg-lime px-4 py-[9px] font-mono text-[13px] font-bold text-bg"
          >
            <Icon name="plus" className="h-2.5 w-2.5" />
            NEW PLAN
          </button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : plans.length > 0 ? (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.trip.id}
              plan={plan}
              onEdit={() => openEdit(plan.trip)}
              onDelete={() => void handleDelete(plan.trip)}
              onMarkBooked={() =>
                void updateMutation.mutateAsync({ id: plan.trip.id, data: { status: 'Booked' } })
              }
              isMarkingBooked={updateMutation.isPending}
            />
          ))}

          <button
            type="button"
            onClick={openCreate}
            className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-[14px] border-[1.5px] border-dashed border-white/[0.06] p-5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-[9px] border border-lime/[0.15] bg-lime/[0.08]">
              <Icon name="plus" className="h-3.5 w-3.5 text-lime" />
            </span>
            <span className="text-center">
              <span className="block text-[13px] font-semibold text-t2">New plan</span>
              <span className="mt-0.5 block text-[11px] text-t3">Brainstorm your next trip</span>
            </span>
          </button>
        </div>
      ) : (
        <EmptyState
          icon={<Icon name="flag" className="mx-auto h-8 w-8 text-t3" />}
          title="No plans in progress"
          description="Start a new plan and track leave, research, and booking progress in one place."
        />
      )}

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editing ? 'Edit Trip' : 'New Plan'}>
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
