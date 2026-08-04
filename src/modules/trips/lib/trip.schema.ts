import { z } from 'zod'

export const tripSchema = z.object({
  title: z.string().min(1, 'Required'),
  purpose: z.string().optional(),
  origin: z.string().min(1, 'Required'),
  destination: z.string().min(1, 'Required'),
  departureDate: z.string().min(1, 'Required'),
  returnDate: z.string().min(1, 'Required'),
  mode: z.enum(['Train', 'Flight', 'Bus']),
  status: z.enum(['Planning', 'Booked', 'Completed', 'Cancelled']),
  estimatedBudget: z.coerce.number().min(0).optional(),
  actualBudget: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
})

export type TripFormValues = z.output<typeof tripSchema>
export type TripFormInput = z.input<typeof tripSchema>
