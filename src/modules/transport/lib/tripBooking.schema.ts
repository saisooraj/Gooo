import { z } from 'zod'
import { DEFAULT_ADVANCE_RESERVATION_DAYS } from '@/constants/transport'

export const tripBookingSchema = z.object({
  tripId: z.string().min(1, 'Select a trip'),
  mode: z.enum(['Train', 'Flight', 'Bus']),
  journeyDate: z.string().min(1, 'Required'),
  bookedDate: z.string().optional(),
  // Train (only mode with real planning logic in V1)
  trainNumber: z.string().optional(),
  trainName: z.string().optional(),
  boardingStation: z.string().optional(),
  destinationStation: z.string().optional(),
  quota: z
    .enum(['General', 'Tatkal', 'Premium Tatkal', 'Ladies', 'Senior Citizen', 'Divyaang'])
    .optional(),
  coach: z.string().optional(),
  seat: z.string().optional(),
  pnr: z.string().optional(),
  advanceReservationDays: z.coerce.number().min(0).default(DEFAULT_ADVANCE_RESERVATION_DAYS),
  priority: z.coerce.number().int().min(1).max(5).default(3),
  demand: z.enum(['Low', 'Medium', 'High', 'Very High']).default('Medium'),
  // Flight — informational only in V1
  airline: z.string().optional(),
  flightNumber: z.string().optional(),
  // Bus — informational only in V1
  operator: z.string().optional(),
  busNumber: z.string().optional(),
  // Shared free-text notes for Flight/Bus
  notes: z.string().optional(),
})

export type TripBookingFormValues = z.output<typeof tripBookingSchema>
export type TripBookingFormInput = z.input<typeof tripBookingSchema>
