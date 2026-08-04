import { z } from 'zod'

export const appSettingsSchema = z.object({
  weekendDays: z.array(z.coerce.number().min(0).max(6)).min(1, 'Pick at least one day'),
  maxContinuousLeaveDays: z.coerce.number().int().min(1).max(14),
})

export type AppSettingsFormValues = z.output<typeof appSettingsSchema>
export type AppSettingsFormInput = z.input<typeof appSettingsSchema>
