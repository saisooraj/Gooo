import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import {
  appSettingsSchema,
  type AppSettingsFormInput,
  type AppSettingsFormValues,
} from '../lib/appSettings.schema'

const DAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
]

export function AppSettingsForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: {
  defaultValues?: Partial<AppSettingsFormInput>
  onSubmit: (values: AppSettingsFormValues) => void
  isSubmitting?: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AppSettingsFormInput, unknown, AppSettingsFormValues>({
    resolver: zodResolver(appSettingsSchema),
    defaultValues: {
      weekendDays: [0, 6],
      maxContinuousLeaveDays: 4,
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <Field label="Weekend Days" error={errors.weekendDays?.message}>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => (
            <label
              key={day.value}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-sm text-t2 has-[:checked]:border-lime has-[:checked]:bg-lime/[0.12] has-[:checked]:text-lime"
            >
              <input
                type="checkbox"
                value={day.value}
                className="h-3.5 w-3.5 rounded"
                {...register('weekendDays')}
              />
              {day.label}
            </label>
          ))}
        </div>
      </Field>
      <Field label="Max Continuous Leave Days" error={errors.maxContinuousLeaveDays?.message}>
        <Input type="number" min={1} max={14} {...register('maxContinuousLeaveDays')} />
      </Field>
      <div className="mt-2 flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save settings'}
        </Button>
      </div>
    </form>
  )
}
