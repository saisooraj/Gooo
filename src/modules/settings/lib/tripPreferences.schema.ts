import { z } from 'zod'

export const tripPreferencesSchema = z.object({
  homeCity: z.string().min(1, 'Required'),
  homeStation: z.string().optional(),
  preferredDestination: z.string().optional(),
  preferredBoardingStation: z.string().optional(),
  preferredTransport: z.enum(['Train', 'Flight', 'Bus']),
  bookingWindowDays: z.coerce.number().min(0),
  preferredTripLengthDays: z.coerce.number().min(1),
  weekendTravelPreference: z.boolean(),
  preferredReturnDay: z.coerce.number().min(0).max(6),
  country: z.string().min(1, 'Required'),
  timezone: z.string().min(1, 'Required'),
})

export type TripPreferencesFormValues = z.output<typeof tripPreferencesSchema>
export type TripPreferencesFormInput = z.input<typeof tripPreferencesSchema>
