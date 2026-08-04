import { z } from 'zod'

export const leaveBalanceSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  leaveType: z.string().min(1, 'Required'),
  // Can legitimately be negative: a mid-year baseline entered without full
  // Jan-this-month history uses a plug value here so today's computed
  // balance matches reality (see leaveCalculations.ts accrual math).
  openingBalance: z.coerce.number(),
  monthlyCredit: z.coerce.number().min(0),
  leaveUsed: z.coerce.number().min(0),
  carryForward: z.coerce.number().min(0),
  carryForwardLimit: z.coerce.number().min(0),
  expiryDate: z.string().optional().nullable(),
})

export type LeaveBalanceFormValues = z.output<typeof leaveBalanceSchema>
export type LeaveBalanceFormInput = z.input<typeof leaveBalanceSchema>
