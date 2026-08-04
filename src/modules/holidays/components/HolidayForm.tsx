import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Field'
import { holidaySchema, type HolidayFormValues } from '../lib/holiday.schema'

export function HolidayForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  defaultValues?: Partial<HolidayFormValues>
  onSubmit: (values: HolidayFormValues) => void
  onCancel: () => void
  isSubmitting?: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HolidayFormValues>({
    resolver: zodResolver(holidaySchema),
    defaultValues: {
      name: '',
      date: '',
      category: 'Public',
      isMandatory: true,
      isOptional: false,
      isRecurring: true,
      country: 'India',
      state: '',
      organization: '',
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <Field label="Holiday Name" error={errors.name?.message}>
        <Input {...register('name')} placeholder="e.g. Republic Day" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date" error={errors.date?.message}>
          <Input type="date" {...register('date')} />
        </Field>
        <Field label="Category" error={errors.category?.message}>
          <Select {...register('category')}>
            <option value="Public">Public</option>
            <option value="Restricted">Restricted</option>
            <option value="Company">Company</option>
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Country" error={errors.country?.message}>
          <Input {...register('country')} />
        </Field>
        <Field label="State (optional)">
          <Input {...register('state')} />
        </Field>
      </div>
      <Field label="Organization (optional)">
        <Input {...register('organization')} placeholder="Leave blank if national/state holiday" />
      </Field>
      <div className="flex flex-wrap gap-4 pt-1 text-sm text-t2">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4 rounded" {...register('isMandatory')} />
          Mandatory
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4 rounded" {...register('isOptional')} />
          Optional
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4 rounded" {...register('isRecurring')} />
          Recurring yearly
        </label>
      </div>
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
