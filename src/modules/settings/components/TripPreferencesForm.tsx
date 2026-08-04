import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Field'
import { DEFAULT_ADVANCE_RESERVATION_DAYS } from '@/constants/transport'
import {
  tripPreferencesSchema,
  type TripPreferencesFormInput,
  type TripPreferencesFormValues,
} from '../lib/tripPreferences.schema'

export function TripPreferencesForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: {
  defaultValues?: Partial<TripPreferencesFormInput>
  onSubmit: (values: TripPreferencesFormValues) => void
  isSubmitting?: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TripPreferencesFormInput, unknown, TripPreferencesFormValues>({
    resolver: zodResolver(tripPreferencesSchema),
    defaultValues: {
      homeCity: '',
      homeStation: '',
      preferredDestination: '',
      preferredBoardingStation: '',
      preferredTransport: 'Train',
      bookingWindowDays: DEFAULT_ADVANCE_RESERVATION_DAYS,
      preferredTripLengthDays: 4,
      weekendTravelPreference: true,
      preferredReturnDay: 0,
      country: 'India',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Home City" error={errors.homeCity?.message}>
          <Input {...register('homeCity')} />
        </Field>
        <Field label="Home Station">
          <Input {...register('homeStation')} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Preferred Destination">
          <Input {...register('preferredDestination')} />
        </Field>
        <Field label="Preferred Boarding Station">
          <Input {...register('preferredBoardingStation')} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Preferred Transport">
          <Select {...register('preferredTransport')}>
            <option value="Train">Train</option>
            <option value="Flight">Flight</option>
            <option value="Bus">Bus</option>
          </Select>
        </Field>
        <Field label="Preferred Trip Length (days)">
          <Input type="number" {...register('preferredTripLengthDays')} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Booking Window (days)">
          <Input type="number" {...register('bookingWindowDays')} />
        </Field>
        <Field label="Preferred Return Day">
          <Select {...register('preferredReturnDay')}>
            <option value={0}>Sunday</option>
            <option value={1}>Monday</option>
            <option value={2}>Tuesday</option>
            <option value={3}>Wednesday</option>
            <option value={4}>Thursday</option>
            <option value={5}>Friday</option>
            <option value={6}>Saturday</option>
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Country" error={errors.country?.message}>
          <Input {...register('country')} />
        </Field>
        <Field label="Timezone" error={errors.timezone?.message}>
          <Input {...register('timezone')} />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-t2">
        <input type="checkbox" className="h-4 w-4 rounded" {...register('weekendTravelPreference')} />
        I'm happy to travel on weekends
      </label>
      <div className="mt-2 flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save preferences'}
        </Button>
      </div>
    </form>
  )
}
