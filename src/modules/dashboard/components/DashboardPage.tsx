import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { fadeUp, springSnappy, staggerContainer } from '@/lib/motion'
import { StatTile } from '@/components/ui/StatTile'
import { Spinner } from '@/components/ui/Spinner'
import { Timeline } from '@/components/ui/Timeline'
import { Card } from '@/components/ui/Card'
import {
  addDays,
  compareDateKeys,
  diffDays,
  formatDisplay,
  todayKey,
  WEEKEND_PRESETS,
} from '@/utils/date'
import { openCommandPalette } from '@/components/layout/CommandPalette'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import { useLeaveBalances } from '@/modules/leaves/hooks/useLeaveBalances'
import { useHolidays } from '@/modules/holidays/hooks/useHolidays'
import { useTrips } from '@/modules/trips/hooks/useTrips'
import { useTripBookings } from '@/modules/transport/hooks/useTripBookings'
import { useSettings } from '@/modules/settings/hooks/useSettings'
import { useGeneratedRecommendations } from '@/modules/recommendations/hooks/useGeneratedRecommendations'
import { useTatkalDashboard } from '@/modules/tatkal/hooks/useTatkalDashboard'
import { computeAnalytics } from '@/modules/analytics/lib/computeAnalytics'
import { computeBookingWindow, getBookingReminder } from '@/modules/transport/lib/bookingWindow'
import type { BookingReminderLevel } from '@/modules/transport/lib/bookingWindow'
import type { BookingWindow } from '@/modules/transport/types/transport.types'
import { DEFAULT_ADVANCE_RESERVATION_DAYS } from '@/constants/transport'
import { RecommendationCard } from '@/modules/recommendations/components/RecommendationCard'
import { buildTatkalWindowItem } from '@/modules/tatkal/lib/tatkalWindowItems'
import { derivePlanSteps } from '@/modules/planning/lib/derivePlanSteps'
import { matchTripLegBookings } from '@/modules/planning/lib/matchTripLegBookings'
import type { TimelineItem } from '@/components/ui/Timeline'

const ACTIONABLE_REMINDERS = new Set<BookingReminderLevel>([
  'book-today',
  'book-tomorrow',
  'book-this-week',
  'already-missed',
])

const REMINDER_DEADLINE: Record<BookingReminderLevel, string> = {
  booked: 'Booked',
  'book-today': 'Today',
  'book-tomorrow': 'Tomorrow',
  'book-this-week': 'This week',
  upcoming: 'Upcoming',
  'already-missed': 'Missed',
}

/** `book-today` covers both "opens today" and "opened a while ago and is still open" — split those apart for display. */
function reminderLabel(window: BookingWindow, reminder: BookingReminderLevel): string {
  if (reminder === 'book-today' && window.status === 'open') {
    return `Open since ${formatDisplay(window.bookingOpensOn, 'MMM D')}`
  }
  return REMINDER_DEADLINE[reminder]
}

function BookingDueSub({
  window,
  reminder,
  journeyDate,
  route,
}: {
  window: BookingWindow
  reminder: BookingReminderLevel
  journeyDate: string
  route: string
}) {
  return (
    <>
      {formatDisplay(window.bookingOpensOn, 'MMM D').toUpperCase()} · {reminderLabel(window, reminder)} ·{' '}
      <span className="text-blue">Train {formatDisplay(journeyDate, 'MMM D').toUpperCase()}</span> · {route}
    </>
  )
}

export function DashboardPage() {
  const year = new Date().getFullYear()
  const today = todayKey()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: leaveBalances, isLoading: loadingLeaves } = useLeaveBalances()
  const { data: holidays, isLoading: loadingHolidays } = useHolidays()
  const { data: trips, isLoading: loadingTrips } = useTrips()
  const { data: bookings, isLoading: loadingBookings } = useTripBookings()
  const { settings } = useSettings()
  const { recommendations, isLoading: loadingRecs } = useGeneratedRecommendations(year)
  const { buckets: tatkalBuckets, plans: tatkalPlans, isLoading: loadingTatkal } = useTatkalDashboard()

  const isLoading = loadingLeaves || loadingHolidays || loadingTrips || loadingBookings || loadingRecs || loadingTatkal

  const tripById = useMemo(() => new Map((trips ?? []).map((t) => [t.id, t])), [trips])
  const holidayDates = useMemo(() => new Set((holidays ?? []).map((h) => h.date)), [holidays])
  const weekend = settings?.weekendDays ?? WEEKEND_PRESETS.SAT_SUN

  // Bare Planning trips with nothing done yet (no leave confirmed, no research,
  // no booking) are DRAFTs on the Planning page — keep them out of Bookings Due
  // too, so exploratory/unstarted trips don't spam the dashboard.
  const inProgressTripIds = useMemo(() => {
    const ids = new Set<string>()
    for (const trip of (trips ?? []).filter((t) => t.status === 'Planning')) {
      const tripBookings = (bookings ?? []).filter((b) => b.tripId === trip.id)
      const tripTatkalPlans = (tatkalPlans ?? []).filter((p) => p.tripId === trip.id)
      if (derivePlanSteps(trip, tripBookings, tripTatkalPlans, holidayDates, weekend).status !== 'DRAFT') {
        ids.add(trip.id)
      }
    }
    return ids
  }, [trips, bookings, tatkalPlans, holidayDates, weekend])

  const analytics = useMemo(
    () =>
      computeAnalytics(
        year,
        leaveBalances ?? [],
        trips ?? [],
        new Set((holidays ?? []).map((h) => h.date)),
        settings?.weekendDays ?? WEEKEND_PRESETS.SAT_SUN,
        bookings ?? [],
      ),
    [year, leaveBalances, trips, holidays, settings, bookings],
  )
  const totalEntitlement = analytics.projectedYearEndBalance + analytics.consumedLeave

  const nextHoliday = useMemo(
    () =>
      (holidays ?? [])
        .filter((h) => compareDateKeys(h.date, today) >= 0)
        .sort((a, b) => compareDateKeys(a.date, b.date))[0],
    [holidays, today],
  )

  const nextTrip = useMemo(
    () =>
      (trips ?? [])
        .filter((t) => t.status !== 'Cancelled' && t.status !== 'Completed' && compareDateKeys(t.departureDate, today) >= 0)
        .sort((a, b) => compareDateKeys(a.departureDate, b.departureDate))[0],
    [trips, today],
  )

  const nextLeave = useMemo(
    () =>
      (trips ?? [])
        .filter((t) => t.status === 'Booked' && compareDateKeys(t.departureDate, today) >= 0)
        .sort((a, b) => compareDateKeys(a.departureDate, b.departureDate))[0],
    [trips, today],
  )

  const bestRecommendation = recommendations[0]

  const actionableBookings = useMemo(
    () =>
      (bookings ?? [])
        .map((booking) => {
          const advanceDays = booking.train?.advanceReservationDays ?? DEFAULT_ADVANCE_RESERVATION_DAYS
          const window = computeBookingWindow(booking.journeyDate, advanceDays)
          const reminder = getBookingReminder(window, booking.bookedDate)
          return { booking, window, reminder }
        })
        .filter((row) => ACTIONABLE_REMINDERS.has(row.reminder))
        .sort((a, b) => a.window.daysUntilOpen - b.window.daysUntilOpen),
    [bookings],
  )

  const tatkalTodayCount = tatkalBuckets.today.length
  const tatkalTomorrowCount = tatkalBuckets.tomorrow.length
  const topBooking = actionableBookings[0]
  const topBookingTrip = topBooking ? tripById.get(topBooking.booking.tripId) : undefined

  const bookingsDueItems = useMemo<TimelineItem[]>(() => {
    const items: (TimelineItem & { sortDate: string })[] = []

    // No day-count cutoff here — every not-yet-booked leg shows, sorted by
    // how soon its window opens; the 5-item cap below keeps the card compact.
    for (const booking of bookings ?? []) {
      const advanceDays = booking.train?.advanceReservationDays ?? DEFAULT_ADVANCE_RESERVATION_DAYS
      const window = computeBookingWindow(booking.journeyDate, advanceDays)
      const reminder = getBookingReminder(window, booking.bookedDate)
      if (reminder === 'booked') continue
      const trip = tripById.get(booking.tripId)
      items.push({
        id: `booking-${booking.id}`,
        color: '#F2844A',
        label: `Book ${trip?.title ?? booking.mode}`,
        sub: (
          <BookingDueSub
            window={window}
            reminder={reminder}
            journeyDate={booking.journeyDate}
            route={trip ? `${trip.origin} → ${trip.destination}` : booking.mode}
          />
        ),
        sortDate: window.bookingOpensOn,
      })
    }

    // Trips still in Planning don't necessarily have a TripBooking leg created
    // yet — synthesize the same reminder straight from the trip's own dates so
    // a bare trip still surfaces once its booking window is due, instead of
    // requiring a booking record to exist first. Only trips with real progress
    // (leave confirmed / research started) qualify — bare DRAFT trips don't.
    // Coverage is matched by count/order (matchTripLegBookings), not an exact
    // date match, since a booking's journey date rarely lines up perfectly
    // with the trip's own departure/return date.
    for (const trip of (trips ?? []).filter((t) => t.status === 'Planning' && inProgressTripIds.has(t.id))) {
      const tripBookings = (bookings ?? []).filter((b) => b.tripId === trip.id)
      const { onward, return: returnBooking } = matchTripLegBookings(trip, tripBookings)
      const legs: { journeyDate: string; label: string }[] =
        trip.departureDate === trip.returnDate
          ? onward || returnBooking
            ? []
            : [{ journeyDate: trip.departureDate, label: trip.title }]
          : [
              ...(onward ? [] : [{ journeyDate: trip.departureDate, label: `${trip.title} (Onward)` }]),
              ...(returnBooking ? [] : [{ journeyDate: trip.returnDate, label: `${trip.title} (Return)` }]),
            ]
      for (const leg of legs) {
        const window = computeBookingWindow(leg.journeyDate, DEFAULT_ADVANCE_RESERVATION_DAYS)
        const reminder = getBookingReminder(window, null)
        items.push({
          id: `trip-reserve-${trip.id}-${leg.journeyDate}`,
          color: '#F2844A',
          label: `Book ${leg.label}`,
          sub: (
            <BookingDueSub
              window={window}
              reminder={reminder}
              journeyDate={leg.journeyDate}
              route={`${trip.origin} → ${trip.destination}`}
            />
          ),
          sortDate: window.bookingOpensOn,
        })
      }
    }

    for (const plan of [...tatkalBuckets.today, ...tatkalBuckets.tomorrow, ...tatkalBuckets.upcoming]) {
      items.push({
        ...buildTatkalWindowItem(plan, tripById.get(plan.tripId), today),
        sortDate: addDays(plan.journeyDate, -1),
      })
    }

    return items.sort((a, b) => compareDateKeys(a.sortDate, b.sortDate)).slice(0, 5)
  }, [tatkalBuckets, tripById, today, trips, bookings, inProgressTripIds])

  const generalQuotaOpensFor = useMemo(
    () => addDays(today, DEFAULT_ADVANCE_RESERVATION_DAYS),
    [today],
  )
  const generalQuotaWeekday = useMemo(() => formatDisplay(generalQuotaOpensFor, 'dddd'), [generalQuotaOpensFor])
  const generalQuotaMatch = useMemo(
    () =>
      (trips ?? []).find(
        (t) => t.departureDate === generalQuotaOpensFor || t.returnDate === generalQuotaOpensFor,
      ),
    [trips, generalQuotaOpensFor],
  )

  const holidayItems = useMemo<TimelineItem[]>(
    () =>
      (holidays ?? [])
        .filter((h) => compareDateKeys(h.date, today) >= 0)
        .sort((a, b) => compareDateKeys(a.date, b.date))
        .slice(0, 5)
        .map((holiday) => ({
          id: `holiday-${holiday.id}`,
          color: '#F5C842',
          label: holiday.name,
          sub: `${formatDisplay(holiday.date, 'MMM D').toUpperCase()} · ${holiday.category} Holiday`,
        })),
    [holidays, today],
  )

  const upcomingTripItems = useMemo<TimelineItem[]>(
    () =>
      (trips ?? [])
        .filter((t) => t.status === 'Booked' && compareDateKeys(t.departureDate, today) >= 0)
        .sort((a, b) => compareDateKeys(a.departureDate, b.departureDate))
        .slice(0, 5)
        .map((trip) => ({
          id: `trip-${trip.id}`,
          color: '#4ECBA0',
          label: `${trip.title}`,
          sub: `${formatDisplay(trip.departureDate, 'MMM D').toUpperCase()}–${formatDisplay(trip.returnDate, 'MMM D').toUpperCase()} · ${trip.destination}`,
        })),
    [trips, today],
  )

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-[1020px] flex-col gap-7">
      <motion.div variants={fadeUp} className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-[5px] font-mono text-xs font-medium tracking-[1.5px] text-t2 uppercase">
            {formatDisplay(today, 'ddd, MMM D').toUpperCase()}
          </div>
          <h1 className="text-[32px] leading-[1.1] font-bold tracking-[-1.2px] text-t1">
            Good {greetingForHour()}
            <br />
            <span className="text-lime">{user?.displayName?.split(' ')[0] ?? 'Traveler'}</span>
          </h1>
        </div>
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={springSnappy}
          onClick={openCommandPalette}
          className="flex items-center gap-2 rounded-[10px] border border-white/5 bg-s2 px-3.5 py-[9px] text-[13px] text-t3"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3" />
            <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <span>Search</span>
          <kbd className="hidden rounded bg-white/[0.04] px-[5px] py-0.5 font-mono text-[10px] text-t3 md:inline">
            ⌘K
          </kbd>
        </motion.button>
      </motion.div>

      {tatkalTodayCount > 0 || tatkalTomorrowCount > 0 ? (
        <ActionBanner
          eyebrow="TATKAL WINDOW"
          title={`Tatkal window ${tatkalTodayCount > 0 ? 'opens today' : 'opens tomorrow'}`}
          subtitle={`${tatkalTodayCount || tatkalTomorrowCount} plan${(tatkalTodayCount || tatkalTomorrowCount) === 1 ? '' : 's'} need attention`}
          cta="VIEW →"
          onClick={() => navigate(ROUTES.tatkal)}
        />
      ) : topBooking ? (
        <ActionBanner
          eyebrow="ACTION NEEDED"
          title={`Book ${topBookingTrip?.title ?? topBooking.booking.mode}`}
          subtitle={`${topBookingTrip ? `${topBookingTrip.origin} → ${topBookingTrip.destination} · ` : ''}Deadline: ${REMINDER_DEADLINE[topBooking.reminder]}`}
          cta="BOOK →"
          onClick={() => navigate(ROUTES.trips)}
        />
      ) : null}

      <motion.div variants={staggerContainer(0.05)} className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
        <StatTile label="Leaves" value={analytics.currentBalance} hint={`of ${Math.round(totalEntitlement)} remaining`} tone="lime" />
        <StatTile
          label="Next Hol"
          value={nextHoliday ? diffDays(today, nextHoliday.date) : '—'}
          hint={nextHoliday ? `days · ${nextHoliday.name}` : 'None scheduled'}
          tone="yellow"
        />
        <StatTile
          label="Next Trip"
          value={nextTrip ? diffDays(today, nextTrip.departureDate) : '—'}
          hint={nextTrip ? `days · ${nextTrip.title}` : 'None planned'}
          tone="blue"
        />
        <StatTile
          label="Next Leave"
          value={nextLeave ? diffDays(today, nextLeave.departureDate) : '—'}
          hint={nextLeave ? `days · ${nextLeave.title}` : 'None booked'}
          tone="green"
        />
        <StatTile
          label="Best"
          value={bestRecommendation ? `${bestRecommendation.efficiency.toFixed(1)}×` : '—'}
          hint={bestRecommendation ? `${bestRecommendation.name} · ${bestRecommendation.leaveUsed} leave` : 'No picks yet'}
          tone="purple"
        />
      </motion.div>

      <motion.div variants={staggerContainer(0.08)} className="grid grid-cols-1 items-start gap-3 lg:grid-cols-3">
        <Card className="p-[22px]">
          <div className="mb-[18px] font-mono text-[9px] font-bold tracking-[1.2px] text-t3 uppercase">
            Upcoming Bookings
          </div>
          {bookingsDueItems.length > 0 ? (
            <Timeline items={bookingsDueItems} />
          ) : (
            <p className="text-sm text-t3">Nothing needs booking right now.</p>
          )}
        </Card>

        <Card className="p-[22px]">
          <div className="mb-[18px] font-mono text-[9px] font-bold tracking-[1.2px] text-t3 uppercase">
            Holidays
          </div>
          {holidayItems.length > 0 ? (
            <Timeline items={holidayItems} />
          ) : (
            <p className="text-sm text-t3">No upcoming holidays.</p>
          )}
        </Card>

        <Card className="p-[22px]">
          <div className="mb-[18px] font-mono text-[9px] font-bold tracking-[1.2px] text-t3 uppercase">
            Upcoming Trips
          </div>
          {upcomingTripItems.length > 0 ? (
            <Timeline items={upcomingTripItems} />
          ) : (
            <p className="text-sm text-t3">No trips booked yet.</p>
          )}
        </Card>
      </motion.div>

      <motion.div variants={staggerContainer(0.08)} className="grid grid-cols-1 items-start gap-3 md:grid-cols-2">
        <Card className="p-[22px]">
          <div className="mb-[18px] flex items-center justify-between">
            <div className="font-mono text-[9px] font-bold tracking-[1.2px] text-t3 uppercase">Top Picks</div>
            <motion.button
              type="button"
              whileHover={{ x: 2 }}
              onClick={() => navigate(ROUTES.recommendations)}
              className="text-[11.5px] font-semibold text-lime"
            >
              see all →
            </motion.button>
          </div>
          {recommendations.length > 0 ? (
            <motion.div variants={staggerContainer(0.05)} initial="hidden" animate="show" className="flex flex-col gap-1.5">
              {recommendations.slice(0, 3).map((rec) => (
                <RecommendationCard
                  key={`${rec.startDate}-${rec.endDate}`}
                  recommendation={rec}
                  onSelect={() => navigate(ROUTES.recommendations)}
                />
              ))}
            </motion.div>
          ) : (
            <p className="text-sm text-t3">Add leave & holidays to get picks.</p>
          )}
        </Card>

        <Card className="p-[22px]">
          <div className="mb-[18px] font-mono text-[9px] font-bold tracking-[1.2px] text-t3 uppercase">
            Opens Today For
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-4xl font-bold text-lime">{DEFAULT_ADVANCE_RESERVATION_DAYS}</span>
            <span className="text-xs text-t3">days out</span>
          </div>
          <p className="mt-2 text-sm text-t2">
            General quota booked today covers travel on{' '}
            <span className="font-semibold text-t1">{formatDisplay(generalQuotaOpensFor, 'MMM D')}</span> ·{' '}
            {generalQuotaWeekday}.
          </p>
          {generalQuotaMatch && (
            <div className="mt-3 rounded-[9px] border border-lime/20 bg-lime/[0.08] px-3 py-2 text-xs text-lime">
              Matches {generalQuotaMatch.title} — book it today!
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}

function greetingForHour(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

function ActionBanner({
  eyebrow,
  title,
  subtitle,
  cta,
  onClick,
}: {
  eyebrow: string
  title: string
  subtitle: string
  cta: string
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      variants={fadeUp}
      initial="hidden"
      animate="show"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={springSnappy}
      onClick={onClick}
      className="relative overflow-hidden rounded-[14px] bg-lime px-6 py-5 text-left"
    >
      <motion.span
        aria-hidden
        className="absolute -top-2.5 -right-2.5 h-[120px] w-[120px] rounded-full bg-black/[0.07]"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span className="absolute top-5 right-[30px] h-[60px] w-[60px] rounded-full bg-black/5" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="mb-1.5 font-mono text-[11px] font-bold tracking-[1.2px] text-black/50 uppercase">
            {eyebrow}
          </div>
          <h2 className="mb-1 text-[19px] font-bold tracking-[-0.5px] text-bg">{title}</h2>
          <p className="text-[13px] text-black/60">{subtitle}</p>
        </div>
        <span className="shrink-0 rounded-[9px] bg-bg px-4 py-[9px] font-mono text-[13px] font-bold whitespace-nowrap text-lime">
          {cta}
        </span>
      </div>
    </motion.button>
  )
}
