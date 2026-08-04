import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { LEAVE_TYPE_PRESETS } from '../types/leave.types'
import {
  leaveBalanceSchema,
  type LeaveBalanceFormInput,
  type LeaveBalanceFormValues,
} from '../lib/leaveBalance.schema'

export function LeaveBalanceForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  defaultValues?: Partial<LeaveBalanceFormInput>
  onSubmit: (values: LeaveBalanceFormValues) => void
  onCancel: () => void
  isSubmitting?: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeaveBalanceFormInput, unknown, LeaveBalanceFormValues>({
    resolver: zodResolver(leaveBalanceSchema),
    defaultValues: {
      year: new Date().getFullYear(),
      leaveType: LEAVE_TYPE_PRESETS[0],
      openingBalance: 0,
      monthlyCredit: 0,
      leaveUsed: 0,
      carryForward: 0,
      carryForwardLimit: 0,
      expiryDate: '',
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Year" error={errors.year?.message}>
          <Input type="number" {...register('year')} />
        </Field>
        <Field label="Leave Type" error={errors.leaveType?.message}>
          <Input list="leave-type-presets" {...register('leaveType')} />
          <datalist id="leave-type-presets">
            {LEAVE_TYPE_PRESETS.map((preset) => (
              <option key={preset} value={preset} />
            ))}
          </datalist>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Opening Balance" error={errors.openingBalance?.message}>
          <Input type="number" step="0.5" {...register('openingBalance')} />
        </Field>
        <Field label="Monthly Credit" error={errors.monthlyCredit?.message}>
          <Input type="number" step="0.5" {...register('monthlyCredit')} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Leave Used" error={errors.leaveUsed?.message}>
          <Input type="number" step="0.5" {...register('leaveUsed')} />
        </Field>
        <Field label="Carry Forward" error={errors.carryForward?.message}>
          <Input type="number" step="0.5" {...register('carryForward')} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Carry Forward Limit" error={errors.carryForwardLimit?.message}>
          <Input type="number" step="0.5" {...register('carryForwardLimit')} />
        </Field>
        <Field label="Expiry Date" error={errors.expiryDate?.message}>
          <Input type="date" {...register('expiryDate')} />
        </Field>
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
