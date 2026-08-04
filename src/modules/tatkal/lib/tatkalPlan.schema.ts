import { z } from 'zod'
import { DEFAULT_TATKAL_BOOKING_WINDOW_DAYS } from './irctcRules'

export const tatkalPlanSchema = z.object({
  tripId: z.string().min(1, 'Select a trip'),
  tripBookingId: z.string().optional(),
  boardingStation: z.string().min(1, 'Required'),
  destinationStation: z.string().min(1, 'Required'),
  journeyDate: z.string().min(1, 'Required'),
  reservationOpensOn: z.string().min(1, 'Required'),
  tatkalClass: z.enum(['AC', 'NonAC']),
  status: z.enum([
    'Planning',
    'Reservation Pending',
    'Reserved Booked',
    'Waiting List',
    'RAC',
    'Confirmed',
    'Tatkal Planned',
    'Tatkal Booked',
    'Cancelled',
    'Completed',
  ]),
  demand: z.enum(['Low', 'Medium', 'High', 'Very High']),
  currentWlNumber: z.coerce.number().min(0).optional(),
  currentRacNumber: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
})

export type TatkalPlanFormValues = z.output<typeof tatkalPlanSchema>
export type TatkalPlanFormInput = z.input<typeof tatkalPlanSchema>

export const backupOptionSchema = z.object({
  priority: z.coerce.number().int().min(1).default(1),
  mode: z.enum(['Train', 'Bus', 'Flight']),
  boardingStation: z.string().optional(),
  destinationStation: z.string().optional(),
  trainNumber: z.string().optional(),
  trainName: z.string().optional(),
  operator: z.string().optional(),
  airline: z.string().optional(),
  flightNumber: z.string().optional(),
  status: z.enum(['Suggested', 'Added', 'Booked', 'Rejected']),
  isAutoSuggested: z.boolean().default(false),
  notes: z.string().optional(),
})

export type BackupOptionFormValues = z.output<typeof backupOptionSchema>
export type BackupOptionFormInput = z.input<typeof backupOptionSchema>

export const tatkalPreferencesSchema = z.object({
  enableTatkalPlanning: z.boolean(),
  defaultBookingWindowDays: z.coerce.number().min(0).default(DEFAULT_TATKAL_BOOKING_WINDOW_DAYS),
  preferredBookingTime: z.string().min(1, 'Required'),
  preferredPaymentMethod: z.string().optional(),
  preferredBoardingStations: z.array(z.string()).default([]),
  preferredDestinationStations: z.array(z.string()).default([]),
  defaultBackupTransport: z.enum(['Train', 'Flight', 'Bus']),
  highDemandAlerts: z.boolean(),
  tatkalReminders: z.boolean(),
})

export type TatkalPreferencesFormValues = z.output<typeof tatkalPreferencesSchema>
export type TatkalPreferencesFormInput = z.input<typeof tatkalPreferencesSchema>