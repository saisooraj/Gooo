import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Field'
import {
  backupOptionSchema,
  type BackupOptionFormInput,
  type BackupOptionFormValues,
} from '../lib/tatkalPlan.schema'

export function BackupOptionForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  defaultValues?: Partial<BackupOptionFormInput>
  onSubmit: (values: BackupOptionFormValues) => void
  onCancel: () => void
  isSubmitting?: boolean
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BackupOptionFormInput, unknown, BackupOptionFormValues>({
    resolver: zodResolver(backupOptionSchema),
    defaultValues: {
      priority: 1,
      mode: 'Train',
      status: 'Added',
      isAutoSuggested: false,
      ...defaultValues,
    },
  })

  const mode = watch('mode')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Priority (1 = first choice)" error={errors.priority?.message}>
          <Input type="number" min={1} {...register('priority')} />
        </Field>
        <Field label="Mode" error={errors.mode?.message}>
          <Select {...register('mode')}>
            <option value="Train">Train</option>
            <option value="Bus">Bus</option>
            <option value="Flight">Flight</option>
          </Select>
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

      {mode === 'Train' ? (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Train Number">
            <Input {...register('trainNumber')} />
          </Field>
          <Field label="Train Name">
            <Input {...register('trainName')} />
          </Field>
        </div>
      ) : mode === 'Flight' ? (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Airline">
            <Input {...register('airline')} />
          </Field>
          <Field label="Flight Number">
            <Input {...register('flightNumber')} />
          </Field>
        </div>
      ) : (
        <Field label="Operator">
          <Input {...register('operator')} />
        </Field>
      )}

      <Field label="Status" error={errors.status?.message}>
        <Select {...register('status')}>
          <option value="Suggested">Suggested</option>
          <option value="Added">Added</option>
          <option value="Booked">Booked</option>
          <option value="Rejected">Rejected</option>
        </Select>
      </Field>

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