import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'
import { formatDisplay } from '@/utils/date'
import { TripBookingCard } from '@/modules/transport/components/TripBookingCard'
import { TripBookingForm } from '@/modules/transport/components/TripBookingForm'
import {
  useCreateTripBooking,
  useRemoveTripBooking,
  useUpdateTripBooking,
} from '@/modules/transport/hooks/useTripBookings'
import { flattenBookingForEdit, toBookingPayload } from '@/modules/transport/lib/bookingPayload'
import type { TripBookingFormValues } from '@/modules/transport/lib/tripBooking.schema'
import type { TripBooking } from '@/modules/transport/types/transport.types'
import { useUpdateTrip } from '../hooks/useTrips'
import type { Trip, TripStatus } from '../types/trip.types'

const STATUS_META: Record<TripStatus, { label: string; color: string }> = {
  Planning: { label: 'DRAFT', color: '#F2844A' },
  Booked: { label: 'PLANNED', color: '#7EB8F7' },
  Completed: { label: 'DONE', color: '#4ECBA0' },
  Cancelled: { label: 'CANCELLED', color: '#FF6B6B' },
}

export function TripCard({
  trip,
  bookings,
  days,
  leaveUsed,
  onEdit,
  onDelete,
}: {
  trip: Trip
  bookings: TripBooking[]
  days: number
  leaveUsed: number
  onEdit: () => void
  onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [bookingSheetOpen, setBookingSheetOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState<TripBooking | null>(null)

  const createBooking = useCreateTripBooking()
  const updateBooking = useUpdateTripBooking()
  const removeBooking = useRemoveTripBooking()
  const updateTrip = useUpdateTrip()

  const meta = STATUS_META[trip.status]
  const primaryBooking = bookings[0]
  const trainInfo = primaryBooking
    ? primaryBooking.train
      ? `${primaryBooking.train.trainNumber} ${primaryBooking.train.trainName}`.trim()
      : `${primaryBooking.mode} booking`
    : 'Not booked yet'

  // A trip sitting in Planning with a real, dated booking already attached is
  // stale — the ticket is booked, the status just never caught up. Surfaced
  // as a one-click nudge rather than auto-flipped silently on page load, so
  // it doesn't fire for a trip mid-way through being backfilled.
  const hasStaleBookedTicket = trip.status === 'Planning' && bookings.some((b) => Boolean(b.bookedDate))

  function openAddBooking() {
    setEditingBooking(null)
    setBookingSheetOpen(true)
  }

  function openEditBooking(booking: TripBooking) {
    setEditingBooking(booking)
    setBookingSheetOpen(true)
  }

  async function markTripBooked() {
    await updateTrip.mutateAsync({ id: trip.id, data: { status: 'Booked' } })
  }

  async function handleBookingSubmit(values: TripBookingFormValues) {
    const payload = toBookingPayload(values)
    if (editingBooking) {
      await updateBooking.mutateAsync({ id: editingBooking.id, data: payload })
    } else {
      await createBooking.mutateAsync(payload)
    }
    // Booking a ticket for a trip that was still marked Planning means it's
    // no longer just a draft — promote it automatically so it shows up under
    // "Upcoming" instead of silently staying in "Drafts".
    if (payload.bookedDate && trip.status === 'Planning') {
      await markTripBooked()
    }
    setBookingSheetOpen(false)
  }

  async function handleBookingDelete(booking: TripBooking) {
    if (window.confirm('Delete this booking?')) {
      await removeBooking.mutateAsync(booking.id)
    }
  }

  return (
    <div className="flex overflow-hidden rounded-[14px] border border-white/[0.04] bg-s1">
      <div className="w-[3px] shrink-0" style={{ background: meta.color }} />
      <div className="flex-1 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-[5px] flex items-center gap-2">
              <h3 className="text-[15px] font-bold tracking-[-0.3px] text-t1">{trip.title}</h3>
              <span
                className="inline-flex items-center rounded px-[7px] py-0.5 font-mono text-[9px] font-bold tracking-[0.5px] uppercase"
                style={{ background: `${meta.color}1F`, color: meta.color }}
              >
                {meta.label}
              </span>
            </div>
            <p className="mb-2.5 font-mono text-xs text-t2">
              {trip.origin} → {trip.destination} · {formatDisplay(trip.departureDate)}–
              {formatDisplay(trip.returnDate)}
            </p>
            <div className="flex flex-wrap gap-3.5">
              <span className="text-xs text-t2">{trainInfo}</span>
              <span className="text-xs text-t2">
                {days}d · {leaveUsed} leave
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="shrink-0 rounded-[7px] border border-white/[0.05] bg-bg px-3 py-1.5 font-mono text-[11.5px] font-bold whitespace-nowrap text-t2"
          >
            {expanded ? 'CLOSE' : 'VIEW'}
          </button>
        </div>

        {hasStaleBookedTicket && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-[9px] border border-orange/20 bg-orange/[0.08] px-3 py-2">
            <span className="text-xs text-orange">Tickets are booked — this is still marked Draft.</span>
            <Button
              variant="ghost"
              size="sm"
              className="!h-auto !py-1 font-mono text-[11px] font-bold text-orange"
              onClick={() => void markTripBooked()}
              disabled={updateTrip.isPending}
            >
              MARK BOOKED →
            </Button>
          </div>
        )}

        {expanded && (
          <div className="mt-4 flex flex-col gap-3 border-t border-white/[0.05] pt-4">
            <div className="flex items-center justify-between">
              <div className="font-mono text-[9px] font-bold tracking-[1.2px] text-t3 uppercase">Bookings</div>
              <button
                type="button"
                onClick={openAddBooking}
                className="font-mono text-[11px] font-bold text-lime"
              >
                + Add booking
              </button>
            </div>
            {bookings.length > 0 ? (
              <div className="flex flex-col gap-2">
                {bookings.map((booking) => (
                  <TripBookingCard
                    key={booking.id}
                    booking={booking}
                    trip={trip}
                    onEdit={() => openEditBooking(booking)}
                    onDelete={() => void handleBookingDelete(booking)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-t3">No bookings linked to this trip yet.</p>
            )}
            <div className="flex justify-end gap-2 border-t border-white/[0.05] pt-3">
              <Button variant="ghost" size="sm" onClick={onEdit}>
                Edit trip
              </Button>
              <Button variant="ghost" size="sm" className="text-red" onClick={onDelete}>
                Delete trip
              </Button>
            </div>
          </div>
        )}
      </div>

      <Sheet
        open={bookingSheetOpen}
        onClose={() => setBookingSheetOpen(false)}
        title={editingBooking ? 'Edit Booking' : 'Add Booking'}
      >
        <TripBookingForm
          trips={[trip]}
          defaultValues={editingBooking ? flattenBookingForEdit(editingBooking) : { tripId: trip.id }}
          onSubmit={(values) => void handleBookingSubmit(values)}
          onCancel={() => setBookingSheetOpen(false)}
          isSubmitting={createBooking.isPending || updateBooking.isPending}
        />
      </Sheet>
    </div>
  )
}
