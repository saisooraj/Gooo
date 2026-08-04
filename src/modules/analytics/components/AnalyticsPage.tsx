import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Select } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Spinner'
import { StatTile } from '@/components/ui/StatTile'
import { formatDisplay, WEEKEND_PRESETS } from '@/utils/date'
import { useLeaveBalances } from '@/modules/leaves/hooks/useLeaveBalances'
import { useHolidays } from '@/modules/holidays/hooks/useHolidays'
import { useTrips } from '@/modules/trips/hooks/useTrips'
import { useTripBookings } from '@/modules/transport/hooks/useTripBookings'
import { useSettings } from '@/modules/settings/hooks/useSettings'
import { useTatkalPlans } from '@/modules/tatkal/hooks/useTatkalPlans'
import { useBackupOptions } from '@/modules/tatkal/hooks/useBackupOptions'
import { computeTatkalAnalytics } from '@/modules/tatkal/lib/analytics'
import { useGeneratedRecommendations } from '@/modules/recommendations/hooks/useGeneratedRecommendations'
import { computeAnalytics } from '../lib/computeAnalytics'
import { computeMonthlyVacationDays } from '../lib/monthlyBreakdown'
import { MonthlyBarChart } from './MonthlyBarChart'

const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

export function AnalyticsPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const { data: leaveBalances, isLoading: loadingLeaves } = useLeaveBalances()
  const { data: holidays, isLoading: loadingHolidays } = useHolidays()
  const { data: trips, isLoading: loadingTrips } = useTrips()
  const { data: bookings, isLoading: loadingBookings } = useTripBookings()
  const { data: tatkalPlans, isLoading: loadingTatkalPlans } = useTatkalPlans()
  const { data: backupOptions, isLoading: loadingBackups } = useBackupOptions()
  const { settings } = useSettings()
  const { recommendations, isLoading: loadingRecs } = useGeneratedRecommendations(year)

  const isLoading =
    loadingLeaves ||
    loadingHolidays ||
    loadingTrips ||
    loadingBookings ||
    loadingTatkalPlans ||
    loadingBackups ||
    loadingRecs

  const summary = useMemo(
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

  const tatkalAnalytics = useMemo(
    () => computeTatkalAnalytics(tatkalPlans ?? [], backupOptions ?? []),
    [tatkalPlans, backupOptions],
  )

  const monthlyDays = useMemo(() => computeMonthlyVacationDays(year, trips ?? []), [year, trips])
  const leavesSpent = summary.consumedLeave + summary.reservedLeave
  const insights = recommendations.slice(0, 3)

  return (
    <div className="mx-auto flex max-w-[860px] flex-col gap-[22px]">
      <PageHeader
        eyebrow="ANALYTICS"
        title="Your story"
        action={
          <Select value={year} onChange={(e) => setYear(Number(e.target.value))} className="!w-32">
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="relative overflow-hidden rounded-2xl border border-lime/[0.15] bg-lime/[0.04] px-8 py-7">
            <div className="mb-2.5 text-[28px] leading-[1.4] font-bold tracking-[-1px] text-t1 sm:text-[34px]">
              You gained{' '}
              <span className="text-lime">
                {summary.vacationDays} vacation
                <br className="hidden sm:block" /> days
              </span>{' '}
              using only <span className="text-green">{leavesSpent} leaves</span>
            </div>
            <div className="text-sm text-t2">
              {Number.isFinite(summary.vacationEfficiency) ? `${summary.vacationEfficiency.toFixed(1)}×` : '—'}{' '}
              efficiency · {summary.vacationStars}★ this year
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
            <StatTile label="Days off" value={summary.vacationDays} tone="blue" />
            <StatTile
              label="Efficiency"
              value={Number.isFinite(summary.vacationEfficiency) ? `${summary.vacationEfficiency.toFixed(1)}×` : '—'}
              tone="lime"
            />
            <StatTile label="Trips" value={summary.totalTrips} tone="green" />
            <StatTile label="Leaves used" value={leavesSpent} tone="orange" />
          </div>

          <MonthlyBarChart months={monthlyDays} year={year} />

          {insights.length > 0 && (
            <div className="rounded-[14px] border border-white/[0.04] bg-s1 px-[22px] py-5">
              <div className="mb-4 font-mono text-[9px] font-bold tracking-[1.2px] text-t3 uppercase">Insights</div>
              <div className="flex flex-col gap-4">
                {insights.map((rec) => (
                  <div key={`${rec.startDate}-${rec.endDate}`} className="flex gap-3.5">
                    <span className="mt-0.5 shrink-0 font-mono text-[11px] font-bold text-lime">→</span>
                    <div>
                      <div className="text-[13.5px] font-semibold text-t1">
                        {rec.name} · {formatDisplay(rec.startDate, 'MMM D')}–{formatDisplay(rec.endDate, 'MMM D')}
                      </div>
                      <div className="mt-[3px] text-[12.5px] leading-[1.55] text-t2">{rec.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="mb-2 font-mono text-xs font-medium tracking-wide text-t3 uppercase">Leave balance</h3>
            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-5">
              <StatTile label="Current Leave Balance" value={summary.currentBalance} hint="Accrued to date, minus used" tone="lime" />
              <StatTile label="Projected Year-End" value={summary.projectedYearEndBalance} hint="If all credits land" tone="blue" />
              <StatTile label="Consumed Leave" value={summary.consumedLeave} hint="Already recorded as used" tone="orange" />
              <StatTile label="Reserved Leave" value={summary.reservedLeave} hint="Held for planned/booked trips" tone="purple" />
              <StatTile
                label="After Planned Trips"
                value={summary.availableAfterReservations}
                hint="Projected minus reserved"
                tone={summary.availableAfterReservations < 0 ? 'red' : 'lime'}
              />
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-mono text-xs font-medium tracking-wide text-t3 uppercase">Trips & efficiency</h3>
            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-5">
              <StatTile
                label="Vacation Efficiency"
                value={Number.isFinite(summary.vacationEfficiency) ? `${summary.vacationEfficiency.toFixed(1)}x` : '—'}
                hint={`${summary.vacationStars}★ · days off per leave day`}
                tone="lime"
              />
              <StatTile label="Vacation Days" value={summary.vacationDays} tone="blue" />
              <StatTile label="Weekend Days Utilized" value={summary.weekendDaysUtilized} tone="purple" />
              <StatTile label="Holiday Days Utilized" value={summary.holidayDaysUtilized} tone="yellow" />
              <StatTile label="Avg Trip Duration" value={summary.averageTripDurationDays.toFixed(1)} hint="days" tone="green" />
              <StatTile label="Total Trips" value={summary.totalTrips} tone="lime" />
              <StatTile label="Completed Trips" value={summary.completedTrips} tone="green" />
              <StatTile label="Planned Trips" value={summary.plannedTrips} tone="blue" />
              <StatTile
                label="Upcoming Bookings"
                value={summary.upcomingBookingsCount}
                hint="Need action soon"
                tone={summary.upcomingBookingsCount > 0 ? 'orange' : 'lime'}
              />
            </div>
          </div>

          {tatkalAnalytics.totalPlans > 0 && (
            <div>
              <h3 className="mb-2 font-mono text-xs font-medium tracking-wide text-t3 uppercase">Tatkal</h3>
              <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-5">
                <StatTile label="Total Plans" value={tatkalAnalytics.totalPlans} tone="purple" />
                <StatTile label="Confirmed" value={tatkalAnalytics.confirmedCount} tone="green" />
                <StatTile label="Pending" value={tatkalAnalytics.pendingCount} tone="orange" />
                <StatTile
                  label="Missed"
                  value={tatkalAnalytics.missedCount}
                  tone={tatkalAnalytics.missedCount > 0 ? 'red' : 'lime'}
                />
                <StatTile
                  label="Success Rate"
                  value={tatkalAnalytics.successRate > 0 ? `${tatkalAnalytics.successRate.toFixed(0)}%` : '—'}
                  hint="Confirmed / (confirmed + missed)"
                  tone="lime"
                />
                <StatTile
                  label="Avg Current WL"
                  value={tatkalAnalytics.averageCurrentWl > 0 ? tatkalAnalytics.averageCurrentWl.toFixed(0) : '—'}
                  tone="blue"
                />
                <StatTile label="Plans with Backups" value={tatkalAnalytics.plansWithBackups} tone="purple" />
                <StatTile label="Backups Booked" value={tatkalAnalytics.backupsBooked} tone="green" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
