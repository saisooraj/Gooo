import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Field'
import { tripSchema, type TripFormInput, type TripFormValues } from '../lib/trip.schema'

export function TripForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  defaultValues?: Partial<TripFormInput>
  onSubmit: (values: TripFormValues) => void
  onCancel: () => void
  isSubmitting?: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TripFormInput, unknown, TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      title: '',
      purpose: '',
      origin: '',
      destination: '',
      departureDate: '',
      returnDate: '',
      mode: 'Train',
      status: 'Planning',
      notes: '',
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <Field label="Title" error={errors.title?.message}>
        <Input {...register('title')} placeholder="e.g. Goa Long Weekend" />
      </Field>
      <Field label="Purpose (optional)">
        <Input {...register('purpose')} placeholder="Leisure, family visit, work…" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Origin" error={errors.origin?.message}>
          <Input {...register('origin')} />
        </Field>
        <Field label="Destination" error={errors.destination?.message}>
          <Input {...register('destination')} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Departure Date" error={errors.departureDate?.message}>
          <Input type="date" {...register('departureDate')} />
        </Field>
        <Field label="Return Date" error={errors.returnDate?.message}>
          <Input type="date" {...register('returnDate')} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Mode" error={errors.mode?.message}>
          <Select {...register('mode')}>
            <option value="Train">Train</option>
            <option value="Flight">Flight</option>
            <option value="Bus">Bus</option>
          </Select>
        </Field>
        <Field label="Status" error={errors.status?.message}>
          <Select {...register('status')}>
            <option value="Planning">Planning</option>
            <option value="Booked">Booked</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Estimated Budget">
          <Input type="number" step="1" {...register('estimatedBudget')} />
        </Field>
        <Field label="Actual Budget">
          <Input type="number" step="1" {...register('actualBudget')} />
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
