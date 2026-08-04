import { z } from 'zod'

export const holidaySchema = z.object({
  name: z.string().min(1, 'Required'),
  date: z.string().min(1, 'Required'),
  category: z.enum(['Public', 'Restricted', 'Company']),
  isMandatory: z.boolean(),
  isOptional: z.boolean(),
  isRecurring: z.boolean(),
  country: z.string().min(1, 'Required'),
  state: z.string().optional(),
  organization: z.string().optional(),
})

export type HolidayFormValues = z.infer<typeof holidaySchema>
