import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { formatDisplay } from '@/utils/date'
import type { Trip } from '@/modules/trips/types/trip.types'
import { computeBookingWindow, getBookingReminder } from '../lib/bookingWindow'
import type { BookingReminderLevel } from '../lib/bookingWindow'
import type { TripBooking } from '../types/transport.types'
import { DEFAULT_ADVANCE_RESERVATION_DAYS } from '@/constants/transport'

const REMINDER_LABEL: Record<BookingReminderLevel, string> = {
  booked: 'Booked',
  'book-today': 'Book today',
  'book-tomorrow': 'Book tomorrow',
  'book-this-week': 'Book this week',
  upcoming: 'Upcoming',
  'already-missed': 'Window missed',
}

const REMINDER_TONE: Record<BookingReminderLevel, 'success' | 'danger' | 'warning' | 'brand' | 'neutral'> = {
  booked: 'success',
  'book-today': 'danger',
  'book-tomorrow': 'warning',
  'book-this-week': 'warning',
  upcoming: 'neutral',
  'already-missed': 'danger',
}

export function TripBookingCard({
  booking,
  trip,
  onEdit,
  onDelete,
}: {
  booking: TripBooking
  trip?: Trip
  onEdit: () => void
  onDelete: () => void
}) {
  const advanceDays = booking.train?.advanceReservationDays ?? DEFAULT_ADVANCE_RESERVATION_DAYS
  const window = computeBookingWindow(booking.journeyDate, advanceDays)
  const reminder = getBookingReminder(window, booking.bookedDate)

  return (
    <Card className="bg-bg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime/[0.1] text-lime">
            <Icon name="train" className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-t1">
              {booking.train?.trainName ??
                booking.flight?.airline ??
                booking.bus?.operator ??
                `${booking.mode} booking`}
              {booking.train?.trainNumber ? ` (${booking.train.trainNumber})` : ''}
              {booking.flight?.flightNumber ? ` (${booking.flight.flightNumber})` : ''}
              {booking.bus?.busNumber ? ` (${booking.bus.busNumber})` : ''}
            </p>
            <p className="text-xs text-t2">{trip?.title ?? 'Unlinked trip'}</p>
          </div>
        </div>
        <Badge tone={REMINDER_TONE[reminder]}>{REMINDER_LABEL[reminder]}</Badge>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-t2">
        <p>Journey: {formatDisplay(booking.journeyDate)}</p>
        <p>Booking opens: {formatDisplay(window.bookingOpensOn)}</p>
        {booking.train?.boardingStation && (
          <p>
            {booking.train.boardingStation} → {booking.train.destinationStation}
          </p>
        )}
        {booking.train?.pnr && <p>PNR: {booking.train.pnr}</p>}
        {booking.train?.demand && <p>Demand: {booking.train.demand}</p>}
        {(booking.flight?.notes || booking.bus?.notes) && (
          <p className="col-span-2">{booking.flight?.notes ?? booking.bus?.notes}</p>
        )}
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <Button variant="ghost" size="sm" className="text-red" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </Card>
  )
}
