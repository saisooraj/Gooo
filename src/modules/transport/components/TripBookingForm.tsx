import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Field'
import { DEFAULT_ADVANCE_RESERVATION_DAYS } from '@/constants/transport'
import type { Trip } from '@/modules/trips/types/trip.types'
import {
  tripBookingSchema,
  type TripBookingFormInput,
  type TripBookingFormValues,
} from '../lib/tripBooking.schema'

export function TripBookingForm({
  trips,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  trips: Trip[]
  defaultValues?: Partial<TripBookingFormInput>
  onSubmit: (values: TripBookingFormValues) => void
  onCancel: () => void
  isSubmitting?: boolean
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TripBookingFormInput, unknown, TripBookingFormValues>({
    resolver: zodResolver(tripBookingSchema),
    defaultValues: {
      tripId: trips[0]?.id ?? '',
      mode: 'Train',
      journeyDate: '',
      advanceReservationDays: DEFAULT_ADVANCE_RESERVATION_DAYS,
      priority: 3,
      demand: 'Medium',
      ...defaultValues,
    },
  })

  const mode = watch('mode')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto pb-1">
      <Field label="Trip" error={errors.tripId?.message}>
        <Select {...register('tripId')}>
          {trips.map((trip) => (
            <option key={trip.id} value={trip.id}>
              {trip.title}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Mode" error={errors.mode?.message}>
          <Select {...register('mode')}>
            <option value="Train">Train</option>
            <option value="Flight">Flight</option>
            <option value="Bus">Bus</option>
          </Select>
        </Field>
        <Field label="Journey Date" error={errors.journeyDate?.message}>
          <Input type="date" {...register('journeyDate')} />
        </Field>
      </div>

      {mode === 'Train' ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Train Number">
              <Input {...register('trainNumber')} />
            </Field>
            <Field label="Train Name">
              <Input {...register('trainName')} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Boarding Station">
              <Input {...register('boardingStation')} />
            </Field>
            <Field label="Destination Station">
              <Input {...register('destinationStation')} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Quota">
              <Select {...register('quota')}>
                <option value="General">General</option>
                <option value="Tatkal">Tatkal</option>
                <option value="Premium Tatkal">Premium Tatkal</option>
                <option value="Ladies">Ladies</option>
                <option value="Senior Citizen">Senior Citizen</option>
                <option value="Divyaang">Divyaang</option>
              </Select>
            </Field>
            <Field label="Priority (1-5)">
              <Input type="number" min={1} max={5} {...register('priority')} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Coach">
              <Input {...register('coach')} />
            </Field>
            <Field label="Seat">
              <Input {...register('seat')} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="PNR">
              <Input {...register('pnr')} />
            </Field>
            <Field label="Advance Reservation (days)">
              <Input type="number" {...register('advanceReservationDays')} />
            </Field>
          </div>
          <Field label="Demand">
            <Select {...register('demand')}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Very High">Very High</option>
            </Select>
          </Field>
        </>
      ) : mode === 'Flight' ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Airline">
              <Input {...register('airline')} />
            </Field>
            <Field label="Flight Number">
              <Input {...register('flightNumber')} />
            </Field>
          </div>
          <Field label="Notes">
            <Input {...register('notes')} placeholder="Flight details (informational for now)" />
          </Field>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Operator">
              <Input {...register('operator')} />
            </Field>
            <Field label="Bus Number">
              <Input {...register('busNumber')} />
            </Field>
          </div>
          <Field label="Notes">
            <Input {...register('notes')} placeholder="Bus details (informational for now)" />
          </Field>
        </>
      )}

      <Field label="Booked Date (once booked)">
        <Input type="date" {...register('bookedDate')} />
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
