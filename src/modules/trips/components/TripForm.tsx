import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Field'
import { eachDateInRange, formatDisplay, isWeekend, WEEKEND_PRESETS } from '@/utils/date'
import type { DateKey, WeekendConfig } from '@/utils/date'
import { fadeUp, staggerContainer } from '@/lib/motion'
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
    <motion.form
      onSubmit={handleSubmit(submit)}
      variants={staggerContainer(0.045)}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-3"
    >
      <motion.div variants={fadeUp}>
        <Field label="Title" error={errors.title?.message}>
          <Input {...register('title')} placeholder="e.g. Goa Long Weekend" />
        </Field>
      </motion.div>
      <motion.div variants={fadeUp}>
        <Field label="Purpose (optional)">
          <Input {...register('purpose')} placeholder="Leisure, family visit, work…" />
        </Field>
      </motion.div>
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
        <Field label="Origin" error={errors.origin?.message}>
          <Input {...register('origin')} />
        </Field>
        <Field label="Destination" error={errors.destination?.message}>
          <Input {...register('destination')} />
        </Field>
      </motion.div>
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
        <Field label="Departure Date" error={errors.departureDate?.message}>
          <Input type="date" {...register('departureDate')} />
        </Field>
        <Field label="Return Date" error={errors.returnDate?.message}>
          <Input type="date" {...register('returnDate')} />
        </Field>
      </motion.div>

      {leaveCandidates.length > 0 && (
        <motion.div variants={fadeUp}>
          <Field label={`Leave days (${leaveCandidates.length - excludedDates.size} of ${leaveCandidates.length})`}>
            <motion.div
              variants={staggerContainer(0.03)}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-1.5 rounded-lg border border-white/10 p-2.5"
            >
              <p className="text-xs text-t3">
                Uncheck any day that didn't actually need leave — e.g. an evening departure straight from
                work.
              </p>
              {leaveCandidates.map((day) => (
                <motion.label
                  key={day}
                  variants={fadeUp}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 text-sm text-t1"
                >
                  <input
                    type="checkbox"
                    checked={!excludedDates.has(day)}
                    onChange={() => toggleLeaveDate(day)}
                    className="h-3.5 w-3.5"
                  />
                  {formatDisplay(day, 'ddd, DD MMM')}
                </motion.label>
              ))}
            </motion.div>
          </Field>
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
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
      </motion.div>
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
        <Field label="Estimated Budget">
          <Input type="number" step="1" {...register('estimatedBudget')} />
        </Field>
        <Field label="Actual Budget">
          <Input type="number" step="1" {...register('actualBudget')} />
        </Field>
      </motion.div>
      <motion.div variants={fadeUp}>
        <Field label="Notes">
          <Input {...register('notes')} />
        </Field>
      </motion.div>
      <motion.div variants={fadeUp} className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save'}
        </Button>
      </motion.div>
    </motion.form>
  )
}
