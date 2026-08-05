import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Field'
import { eachDateInRange, formatDisplay, isWeekend, WEEKEND_PRESETS } from '@/utils/date'
import type { DateKey, WeekendConfig } from '@/utils/date'
import { tripSchema, type TripFormInput, type TripFormValues } from '../lib/trip.schema'

export function TripForm({
  defaultValues,
  holidayDates = new Set(),
  weekend = WEEKEND_PRESETS.SAT_SUN,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  defaultValues?: Partial<TripFormInput>
  /** Used to compute the per-date leave checklist below. */
  holidayDates?: ReadonlySet<DateKey>
  weekend?: WeekendConfig
  onSubmit: (values: TripFormValues) => void
  onCancel: () => void
  isSubmitting?: boolean
}) {
  const {
    register,
    handleSubmit,
    watch,
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
      excludedLeaveDates: [],
      ...defaultValues,
    },
  })

  const departureDate = watch('departureDate')
  const returnDate = watch('returnDate')

  // Every workday in the trip span is a *candidate* leave day — the user can
  // uncheck ones that didn't actually need leave (e.g. an evening departure
  // straight from work).
  const leaveCandidates = useMemo(() => {
    if (!departureDate || !returnDate || departureDate > returnDate) return []
    return eachDateInRange(departureDate, returnDate).filter(
      (day) => !holidayDates.has(day) && !isWeekend(day, weekend),
    )
  }, [departureDate, returnDate, holidayDates, weekend])

  const [excludedDates, setExcludedDates] = useState<Set<DateKey>>(
    new Set(defaultValues?.excludedLeaveDates ?? []),
  )

  function toggleLeaveDate(day: DateKey) {
    setExcludedDates((prev) => {
      const next = new Set(prev)
      if (next.has(day)) next.delete(day)
      else next.add(day)
      return next
    })
  }

  function submit(values: TripFormValues) {
    onSubmit({ ...values, excludedLeaveDates: leaveCandidates.filter((day) => excludedDates.has(day)) })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-3">
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

      {leaveCandidates.length > 0 && (
        <Field label={`Leave days (${leaveCandidates.length - excludedDates.size} of ${leaveCandidates.length})`}>
          <div className="flex flex-col gap-1.5 rounded-lg border border-white/10 p-2.5">
            <p className="text-xs text-t3">
              Uncheck any day that didn't actually need leave — e.g. an evening departure straight from
              work.
            </p>
            {leaveCandidates.map((day) => (
              <label key={day} className="flex items-center gap-2 text-sm text-t1">
                <input
                  type="checkbox"
                  checked={!excludedDates.has(day)}
                  onChange={() => toggleLeaveDate(day)}
                  className="h-3.5 w-3.5"
                />
                {formatDisplay(day, 'ddd, DD MMM')}
              </label>
            ))}
          </div>
        </Field>
      )}

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
