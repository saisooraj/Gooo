import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/utils/cn'
import { addDays, compareDateKeys, formatDisplay, getMonth, getYear, toDateKey } from '@/utils/date'
import { useHolidays } from '@/modules/holidays/hooks/useHolidays'
import { useTrips } from '@/modules/trips/hooks/useTrips'
import { useTripBookings } from '@/modules/transport/hooks/useTripBookings'
import { useTatkalPlans } from '@/modules/tatkal/hooks/useTatkalPlans'
import { computeBookingWindow } from '@/modules/transport/lib/bookingWindow'
import { DEFAULT_ADVANCE_RESERVATION_DAYS } from '@/constants/transport'
import { buildMonthGrid } from '../lib/monthGrid'
import { useCalendarData, type CalendarTag } from '../hooks/useCalendarData'
import { CalendarLegend } from './CalendarLegend'
import { ManageHolidaysSheet } from './ManageHolidaysSheet'

const EVENT_DOT: Partial<Record<CalendarTag, string>> = {
  trip: '#C4A6FF',
  tatkal: '#FF6B6B',
  recommended: '#4ECBA0',
  bookingOpens: '#F2844A',
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface UpcomingEvent {
  id: string
  date: string
  name: string
  desc: string
  color: string
}

export function CalendarPage() {
  const now = new Date()
  const [cursor, setCursor] = useState(toDateKey(now))
  const [manageOpen, setManageOpen] = useState(false)
  const year = getYear(cursor)
  const month = getMonth(cursor)
  const today = toDateKey(now)

  const { getTags } = useCalendarData(year)
  const { data: holidays } = useHolidays()
  const { data: trips } = useTrips()
  const { data: bookings } = useTripBookings()
  const { data: tatkalPlans } = useTatkalPlans()
  const cells = buildMonthGrid(year, month)

  const holidaysByDate = useMemo(() => new Map((holidays ?? []).map((h) => [h.date, h])), [holidays])

  function shiftMonth(delta: number) {
    const next = new Date(year, month - 1 + delta, 1)
    setCursor(toDateKey(next))
  }

  const upcoming = useMemo<UpcomingEvent[]>(() => {
    const events: UpcomingEvent[] = []

    for (const holiday of (holidays ?? []).filter((h) => compareDateKeys(h.date, today) >= 0)) {
      events.push({ id: `h-${holiday.id}`, date: holiday.date, name: holiday.name, desc: `${holiday.category} Holiday`, color: '#F5C842' })
    }

    for (const trip of (trips ?? []).filter(
      (t) => (t.status === 'Booked' || t.status === 'Planning') && compareDateKeys(t.departureDate, today) >= 0,
    )) {
      events.push({
        id: `t-${trip.id}`,
        date: trip.departureDate,
        name: trip.title,
        desc: `${trip.origin} → ${trip.destination}`,
        color: '#C4A6FF',
      })
    }

    for (const plan of (tatkalPlans ?? []).filter((p) => p.status !== 'Cancelled' && p.status !== 'Completed')) {
      const opensOn = addDays(plan.journeyDate, -1)
      if (compareDateKeys(opensOn, today) >= 0) {
        events.push({
          id: `tk-${plan.id}`,
          date: opensOn,
          name: `Tatkal window: ${plan.boardingStation} → ${plan.destinationStation}`,
          desc: 'Tatkal booking opens',
          color: '#FF6B6B',
        })
      }
    }

    for (const booking of bookings ?? []) {
      const advanceDays = booking.train?.advanceReservationDays ?? DEFAULT_ADVANCE_RESERVATION_DAYS
      const window = computeBookingWindow(booking.journeyDate, advanceDays)
      if (compareDateKeys(window.bookingOpensOn, today) >= 0) {
        events.push({
          id: `b-${booking.id}`,
          date: window.bookingOpensOn,
          name: `Booking opens: ${booking.mode}`,
          desc: `Journey ${formatDisplay(booking.journeyDate)}`,
          color: '#F2844A',
        })
      }
    }

    return events.sort((a, b) => compareDateKeys(a.date, b.date)).slice(0, 8)
  }, [holidays, trips, tatkalPlans, bookings, today])

  return (
    <div className="mx-auto flex max-w-[960px] flex-col gap-6">
      <PageHeader
        eyebrow="CALENDAR"
        title={`${MONTH_NAMES[month - 1]} ${year}`}
        action={
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.04] bg-s1 text-t2"
            >
              <Icon name="chevronRight" className="h-3.5 w-3.5 rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.04] bg-s1 text-t2"
            >
              <Icon name="chevronRight" className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setManageOpen(true)}
              className="rounded-lg border border-white/[0.04] bg-s1 px-3 py-2 text-xs font-semibold text-t2"
            >
              Manage holidays
            </button>
          </div>
        }
      />

      <div className="overflow-hidden rounded-[14px] border border-white/[0.04] bg-s1">
        <div className="grid grid-cols-7">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((label) => (
            <div
              key={label}
              className="border-b border-white/[0.04] py-3 text-center font-mono text-[9px] font-bold tracking-[1px] text-t3"
            >
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((cell) => {
            const tags = getTags(cell.date)
            const isToday = cell.date === today
            const isWeekend = tags.has('weekend')
            const holiday = holidaysByDate.get(cell.date)
            const eventTags = (['trip', 'tatkal', 'recommended', 'bookingOpens'] as CalendarTag[]).filter((t) =>
              tags.has(t),
            )

            return (
              <div
                key={cell.date}
                className={cn(
                  'min-h-[72px] border-r border-b border-white/[0.03] p-2',
                  isToday && 'bg-lime/5',
                  !cell.inMonth && 'opacity-30',
                )}
              >
                <div
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs',
                    isToday ? 'font-bold text-lime bg-lime/15' : isWeekend ? 'text-orange/70' : 'text-t1/50',
                  )}
                >
                  {Number(cell.date.slice(-2))}
                </div>
                {holiday && (
                  <div className="mt-0.5 truncate text-[8px] leading-tight text-yellow">{holiday.name}</div>
                )}
                {eventTags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-0.5">
                    {eventTags.map((t) => (
                      <span key={t} className="h-1 w-1 rounded-full" style={{ background: EVENT_DOT[t] }} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <CalendarLegend />

      <div className="rounded-[14px] border border-white/[0.04] bg-s1 px-[22px] py-5">
        <div className="mb-4 font-mono text-[9px] font-bold tracking-[1.2px] text-t3 uppercase">Upcoming</div>
        <div className="flex flex-col gap-2.5">
          {upcoming.length > 0 ? (
            upcoming.map((event) => (
              <div key={event.id} className="flex items-center gap-3">
                <div className="flex h-[38px] w-[38px] shrink-0 flex-col items-center justify-center rounded-[9px] border border-white/5 bg-bg">
                  <div className="font-mono text-[7px] font-bold tracking-[0.5px] text-t3">
                    {formatDisplay(event.date, 'MMM').toUpperCase()}
                  </div>
                  <div className="font-mono text-base leading-[1.1] font-bold text-t1">
                    {formatDisplay(event.date, 'D')}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-t1">{event.name}</div>
                  <div className="mt-0.5 text-[11.5px] text-t2">{event.desc}</div>
                </div>
                <span className="h-[7px] w-[7px] shrink-0 rounded-full" style={{ background: event.color }} />
              </div>
            ))
          ) : (
            <p className="text-sm text-t3">Nothing coming up.</p>
          )}
        </div>
      </div>

      <ManageHolidaysSheet open={manageOpen} onClose={() => setManageOpen(false)} />
    </div>
  )
}
