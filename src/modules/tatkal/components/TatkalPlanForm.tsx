import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Field'
import type { Trip } from '@/modules/trips/types/trip.types'
import type { TripBooking } from '@/modules/transport/types/transport.types'
import {
  tatkalPlanSchema,
  type TatkalPlanFormInput,
  type TatkalPlanFormValues,
} from '../lib/tatkalPlan.schema'

const STATUS_OPTIONS: TatkalPlanFormValues['status'][] = [
  'Planning',
  'Reservation Pending',
  'Reserved Booked',
  'Waiting List',
  'RAC',
  'Confirmed',
  'Tatkal Planned',
  'Tatkal Booked',
  'Cancelled',
  'Completed',
]

export function TatkalPlanForm({
  trips,
  bookings,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  trips: Trip[]
  bookings: TripBooking[]
  defaultValues?: Partial<TatkalPlanFormInput>
  onSubmit: (values: TatkalPlanFormValues) => void
  onCancel: () => void
  isSubmitting?: boolean
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TatkalPlanFormInput, unknown, TatkalPlanFormValues>({
    resolver: zodResolver(tatkalPlanSchema),
    defaultValues: {
      tripId: trips[0]?.id ?? '',
      tatkalClass: 'AC',
      status: 'Planning',
      demand: 'Medium',
      reservationOpensOn: '',
      ...defaultValues,
    },
  })

  const tripId = watch('tripId')
  const linkedBookings = bookings.filter((b) => b.tripId === tripId && b.mode === 'Train')

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto pb-1"
    >
      <Field label="Trip" error={errors.tripId?.message}>
        <Select {...register('tripId')}>
          {trips.map((trip) => (
            <option key={trip.id} value={trip.id}>
              {trip.title}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Linked booking (optional)">
        <Select {...register('tripBookingId')}>
          <option value="">None</option>
          {linkedBookings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.train?.trainName ?? 'Train booking'} · {b.journeyDate}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Boarding Station" error={errors.boardingStation?.message}>
          <Input {...register('boardingStation')} />
        </Field>
        <Field label="Destination Station" error={errors.destinationStation?.message}>
          <Input {...register('destinationStation')} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Journey Date" error={errors.journeyDate?.message}>
          <Input type="date" {...register('journeyDate')} />
        </Field>
        <Field label="Reservation Opens On" error={errors.reservationOpensOn?.message}>
          <Input type="date" {...register('reservationOpensOn')} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Tatkal Class" error={errors.tatkalClass?.message}>
          <Select {...register('tatkalClass')}>
            <option value="AC">AC (10:00)</option>
            <option value="NonAC">Non-AC (11:00)</option>
          </Select>
        </Field>
        <Field label="Demand" error={errors.demand?.message}>
          <Select {...register('demand')}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Very High">Very High</option>
          </Select>
        </Field>
      </div>

      <Field label="Status" error={errors.status?.message}>
        <Select {...register('status')}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Current WL #">
          <Input type="number" min={0} {...register('currentWlNumber')} />
        </Field>
        <Field label="Current RAC #">
          <Input type="number" min={0} {...register('currentRacNumber')} />
        </Field>
      </div>

      <Field label="Notes">
        <Input {...register('notes')} />
      </Field>

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
