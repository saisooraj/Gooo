import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Field'
import { DEFAULT_TATKAL_BOOKING_WINDOW_DAYS } from '../lib/irctcRules'
import {
  tatkalPreferencesSchema,
  type TatkalPreferencesFormInput,
  type TatkalPreferencesFormValues,
} from '../lib/tatkalPlan.schema'

function stationsToCsv(stations?: string[]): string {
  return (stations ?? []).join(', ')
}

function csvToStations(csv: string): string[] {
  return csv
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

/**
 * Self-contained Tatkal preferences form, rendered from SettingsPage. The
 * tatkal module owns its data end-to-end — SettingsPage just hosts the Card.
 * The two station arrays are edited as CSV strings for simplicity.
 */
export function TatkalPreferencesForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: {
  defaultValues?: Partial<TatkalPreferencesFormInput> & {
    preferredBoardingStations?: string[]
    preferredDestinationStations?: string[]
  }
  onSubmit: (values: TatkalPreferencesFormValues) => void
  isSubmitting?: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<
    TatkalPreferencesFormInput & {
      preferredBoardingStationsCsv: string
      preferredDestinationStationsCsv: string
    },
    unknown,
    TatkalPreferencesFormValues & {
      preferredBoardingStationsCsv: string
      preferredDestinationStationsCsv: string
    }
  >({
    resolver: zodResolver(
      tatkalPreferencesSchema.extend({
        preferredBoardingStationsCsv: z.string().optional(),
        preferredDestinationStationsCsv: z.string().optional(),
      }),
    ) as never,
    defaultValues: {
      enableTatkalPlanning: true,
      defaultBookingWindowDays: DEFAULT_TATKAL_BOOKING_WINDOW_DAYS,
      preferredBookingTime: '10:00',
      preferredBoardingStations: [],
      preferredDestinationStations: [],
      preferredBoardingStationsCsv: stationsToCsv(defaultValues?.preferredBoardingStations),
      preferredDestinationStationsCsv: stationsToCsv(defaultValues?.preferredDestinationStations),
      defaultBackupTransport: 'Bus',
      highDemandAlerts: true,
      tatkalReminders: true,
      ...defaultValues,
    },
  })

  function submit(values: TatkalPreferencesFormValues & {
    preferredBoardingStationsCsv: string
    preferredDestinationStationsCsv: string
  }) {
    onSubmit({
      ...values,
      preferredBoardingStations: csvToStations(values.preferredBoardingStationsCsv),
      preferredDestinationStations: csvToStations(values.preferredDestinationStationsCsv),
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-3">
      <label className="flex items-center gap-2 text-sm text-t2">
        <input type="checkbox" className="h-4 w-4 rounded" {...register('enableTatkalPlanning')} />
        Enable Tatkal planning
      </label>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Default Booking Window (days)">
          <Input type="number" min={0} {...register('defaultBookingWindowDays')} />
        </Field>
        <Field label="Preferred Booking Time" error={errors.preferredBookingTime?.message}>
          <Input type="time" {...register('preferredBookingTime')} />
        </Field>
      </div>

      <Field label="Preferred Payment Method">
        <Input {...register('preferredPaymentMethod')} placeholder="e.g. UPI, Credit Card" />
      </Field>

      <Field label="Preferred Boarding Stations (comma-separated)">
        <Input {...register('preferredBoardingStationsCsv')} placeholder="e.g. KSR Bengaluru, Whitefield" />
      </Field>

      <Field label="Preferred Destination Stations (comma-separated)">
        <Input {...register('preferredDestinationStationsCsv')} placeholder="e.g. Ernakulam Jn, Aluva" />
      </Field>

      <Field label="Default Backup Transport">
        <Select {...register('defaultBackupTransport')}>
          <option value="Train">Train</option>
          <option value="Flight">Flight</option>
          <option value="Bus">Bus</option>
        </Select>
      </Field>

      <div className="flex flex-wrap gap-4 pt-1 text-sm text-t2">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4 rounded" {...register('highDemandAlerts')} />
          High-demand alerts
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4 rounded" {...register('tatkalReminders')} />
          Tatkal reminders
        </label>
      </div>

      <div className="mt-2 flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save Tatkal preferences'}
        </Button>
      </div>
    </form>
  )
}