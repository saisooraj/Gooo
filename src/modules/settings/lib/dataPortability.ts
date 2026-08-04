import type { FirestoreDocument } from '@/types/firestore'
import type { TripBooking } from '@/modules/transport/types/transport.types'

export interface DataExportPayload {
  version: 1
  exportedAt: string
  leaveBalances: Record<string, unknown>[]
  holidays: Record<string, unknown>[]
  /** Each item carries `_ref` (its original id) so bookings can re-link after import. */
  trips: Record<string, unknown>[]
  /** Each item carries `tripRef` instead of `tripId` — resolved back to a real id on import. */
  tripBookings: Record<string, unknown>[]
  tripPreferences: Record<string, unknown>[]
  /** Tatkal plans carry `_ref` so backup options can re-link after import. */
  tatkalPlans: Record<string, unknown>[]
  /** Backup options carry `tatkalPlanRef` instead of `tatkalPlanId`. */
  backupOptions: Record<string, unknown>[]
  tatkalPreferences: Record<string, unknown>[]
}

function stripMeta<T extends FirestoreDocument>(item: T): Record<string, unknown> {
  const { id: _id, userId: _userId, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = item
  return rest
}

/** Trips keep a `_ref` to their original id, since bookings need something stable to point at. */
function tripToExport(trip: FirestoreDocument): Record<string, unknown> {
  return { ...stripMeta(trip), _ref: trip.id }
}

/** Bookings reference their trip via `tripRef` (the trip's original id), not a live `tripId`. */
function tripBookingToExport(booking: TripBooking): Record<string, unknown> {
  const { tripId, ...rest } = stripMeta(booking)
  return { ...rest, tripRef: tripId }
}

/** Tatkal plans keep a `_ref` so backup options can re-link after import. */
function tatkalPlanToExport(plan: FirestoreDocument): Record<string, unknown> {
  return { ...stripMeta(plan), _ref: plan.id }
}

/** Backup options reference their plan via `tatkalPlanRef` (the plan's original id). */
function backupOptionToExport(option: FirestoreDocument): Record<string, unknown> {
  const { tatkalPlanId, ...rest } = stripMeta(option)
  return { ...rest, tatkalPlanRef: tatkalPlanId }
}

/** Strips server-assigned fields so exported records can be re-created for any user. */
export function buildExportPayload(data: {
  leaveBalances: FirestoreDocument[]
  holidays: FirestoreDocument[]
  trips: FirestoreDocument[]
  tripBookings: TripBooking[]
  tripPreferences: FirestoreDocument[]
  tatkalPlans: FirestoreDocument[]
  backupOptions: FirestoreDocument[]
  tatkalPreferences: FirestoreDocument[]
}): DataExportPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    leaveBalances: data.leaveBalances.map(stripMeta),
    holidays: data.holidays.map(stripMeta),
    trips: data.trips.map(tripToExport),
    tripBookings: data.tripBookings.map(tripBookingToExport),
    tripPreferences: data.tripPreferences.map(stripMeta),
    tatkalPlans: data.tatkalPlans.map(tatkalPlanToExport),
    backupOptions: data.backupOptions.map(backupOptionToExport),
    tatkalPreferences: data.tatkalPreferences.map(stripMeta),
  }
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function asArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? (value as Record<string, unknown>[]) : []
}

export function parseImportFile(text: string): DataExportPayload {
  const parsed: unknown = JSON.parse(text)
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Invalid backup file')
  }
  const record = parsed as Record<string, unknown>
  return {
    version: 1,
    exportedAt: typeof record.exportedAt === 'string' ? record.exportedAt : new Date().toISOString(),
    leaveBalances: asArray(record.leaveBalances),
    holidays: asArray(record.holidays),
    trips: asArray(record.trips),
    tripBookings: asArray(record.tripBookings),
    tripPreferences: asArray(record.tripPreferences),
    tatkalPlans: asArray(record.tatkalPlans),
    backupOptions: asArray(record.backupOptions),
    tatkalPreferences: asArray(record.tatkalPreferences),
  }
}