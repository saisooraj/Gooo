import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useHolidays, useCreateHoliday } from '@/modules/holidays/hooks/useHolidays'
import { useLeaveBalances, useCreateLeaveBalance } from '@/modules/leaves/hooks/useLeaveBalances'
import { useTrips, useCreateTrip } from '@/modules/trips/hooks/useTrips'
import { useTripBookings, useCreateTripBooking } from '@/modules/transport/hooks/useTripBookings'
import { useTatkalPlans, useCreateTatkalPlan } from '@/modules/tatkal/hooks/useTatkalPlans'
import { useBackupOptions, useCreateBackupOption } from '@/modules/tatkal/hooks/useBackupOptions'
import {
  useTatkalPreferencesList,
  useCreateTatkalPreferences,
} from '@/modules/tatkal/hooks/useTatkalPreferences'
import { useTripPreferencesList, useCreateTripPreferences } from '../hooks/useTripPreferences'
import { buildExportPayload, downloadJson, parseImportFile } from '../lib/dataPortability'
import type { NewDocument } from '@/types/firestore'
import type { LeaveBalance } from '@/modules/leaves/types/leave.types'
import type { Holiday } from '@/modules/holidays/types/holiday.types'
import type { Trip } from '@/modules/trips/types/trip.types'
import type { TripBooking } from '@/modules/transport/types/transport.types'
import type { TatkalPlan, BackupOption, TatkalPreferences } from '@/modules/tatkal/types/tatkal.types'
import type { TripPreferences } from '../types/settings.types'

export function DataImportExport() {
  const { data: leaveBalances } = useLeaveBalances()
  const { data: holidays } = useHolidays()
  const { data: trips } = useTrips()
  const { data: tripBookings } = useTripBookings()
  const { data: tripPreferences } = useTripPreferencesList()
  const { data: tatkalPlans } = useTatkalPlans()
  const { data: backupOptions } = useBackupOptions()
  const { data: tatkalPreferences } = useTatkalPreferencesList()

  const createLeaveBalance = useCreateLeaveBalance()
  const createHoliday = useCreateHoliday()
  const createTrip = useCreateTrip()
  const createTripBooking = useCreateTripBooking()
  const createTripPreferences = useCreateTripPreferences()
  const createTatkalPlan = useCreateTatkalPlan()
  const createBackupOption = useCreateBackupOption()
  const createTatkalPreferences = useCreateTatkalPreferences()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  function handleExport() {
    const payload = buildExportPayload({
      leaveBalances: leaveBalances ?? [],
      holidays: holidays ?? [],
      trips: trips ?? [],
      tripBookings: tripBookings ?? [],
      tripPreferences: tripPreferences ?? [],
      tatkalPlans: tatkalPlans ?? [],
      backupOptions: backupOptions ?? [],
      tatkalPreferences: tatkalPreferences ?? [],
    })
    downloadJson(`gooo-backup-${new Date().toISOString().slice(0, 10)}.json`, payload)
  }

  async function handleImportFile(file: File) {
    setIsImporting(true)
    setStatus(null)
    try {
      const text = await file.text()
      const payload = parseImportFile(text)

      let imported = 0
      for (const item of payload.leaveBalances) {
        await createLeaveBalance.mutateAsync(item as unknown as NewDocument<LeaveBalance>)
        imported++
      }
      for (const item of payload.holidays) {
        await createHoliday.mutateAsync(item as unknown as NewDocument<Holiday>)
        imported++
      }

      // Trips are created first so their brand-new Firestore ids can be
      // resolved from each item's `_ref` — bookings point at `tripRef`
      // (the trip's *original* id), never a live `tripId`, since a fresh
      // import always mints new ids.
      const tripRefToNewId = new Map<string, string>()
      for (const item of payload.trips) {
        const { _ref, ...tripData } = item
        const newId = await createTrip.mutateAsync(tripData as unknown as NewDocument<Trip>)
        if (typeof _ref === 'string') tripRefToNewId.set(_ref, newId)
        imported++
      }

      for (const item of payload.tripBookings) {
        const { tripRef, ...bookingData } = item
        const tripId = typeof tripRef === 'string' ? (tripRefToNewId.get(tripRef) ?? tripRef) : ''
        await createTripBooking.mutateAsync({
          ...bookingData,
          tripId,
        } as unknown as NewDocument<TripBooking>)
        imported++
      }

      for (const item of payload.tripPreferences) {
        await createTripPreferences.mutateAsync(item as unknown as NewDocument<TripPreferences>)
        imported++
      }

      // Tatkal plans are created first so backup options can re-link via
      // `tatkalPlanRef` → new id, mirroring the trip/booking pattern.
      const planRefToNewId = new Map<string, string>()
      for (const item of payload.tatkalPlans) {
        const { _ref, ...planData } = item
        const newId = await createTatkalPlan.mutateAsync(planData as unknown as NewDocument<TatkalPlan>)
        if (typeof _ref === 'string') planRefToNewId.set(_ref, newId)
        imported++
      }

      for (const item of payload.backupOptions) {
        const { tatkalPlanRef, ...optionData } = item
        const tatkalPlanId =
          typeof tatkalPlanRef === 'string' ? (planRefToNewId.get(tatkalPlanRef) ?? tatkalPlanRef) : ''
        await createBackupOption.mutateAsync({
          ...optionData,
          tatkalPlanId,
        } as unknown as NewDocument<BackupOption>)
        imported++
      }

      for (const item of payload.tatkalPreferences) {
        await createTatkalPreferences.mutateAsync(item as unknown as NewDocument<TatkalPreferences>)
        imported++
      }

      setStatus(`Imported ${imported} record${imported === 1 ? '' : 's'}.`)
    } catch {
      setStatus('Import failed — check the file is a valid Gooo backup.')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium text-t1">Backup & Restore</h3>
      <p className="mt-1 text-xs text-t2">
        Export everything as JSON, or import a previous backup. No personal data is preloaded — your
        account starts empty.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={handleExport}>
          Export JSON
        </Button>
        <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
          {isImporting ? 'Importing…' : 'Import JSON'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleImportFile(file)
            e.target.value = ''
          }}
        />
      </div>
      {status && <p className="mt-2 text-xs text-t2">{status}</p>}
    </Card>
  )
}