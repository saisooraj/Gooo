import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { staggerContainer } from '@/lib/motion'
import { PageHeader } from '@/components/layout/PageHeader'
import { Select } from '@/components/ui/Field'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { Icon } from '@/components/ui/Icon'
import { Sheet } from '@/components/ui/Sheet'
import { StatTile } from '@/components/ui/StatTile'
import { compareDateKeys, diffDays, todayKey, WEEKEND_PRESETS } from '@/utils/date'
import { ROUTES } from '@/constants/routes'
import { useCreateTrip } from '@/modules/trips/hooks/useTrips'
import { TripForm } from '@/modules/trips/components/TripForm'
import type { TripFormValues } from '@/modules/trips/lib/trip.schema'
import { useLeaveBalances } from '@/modules/leaves/hooks/useLeaveBalances'
import { useHolidays } from '@/modules/holidays/hooks/useHolidays'
import { useTrips } from '@/modules/trips/hooks/useTrips'
import { useSettings } from '@/modules/settings/hooks/useSettings'
import { computeAnalytics } from '@/modules/analytics/lib/computeAnalytics'
import { useGeneratedRecommendations } from '../hooks/useGeneratedRecommendations'
import { RecommendationCard } from './RecommendationCard'
import { RecommendationDetail } from './RecommendationDetail'
import { RecommendationFilters, matchesDuration } from './RecommendationFilters'
import type { DurationFilter } from './RecommendationFilters'
import type { VacationRecommendation } from '../types/recommendation.types'

const YEAR_OPTIONS = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() + i)

export function RecommendationsPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const { recommendations, isLoading } = useGeneratedRecommendations(year)
  const { data: balances } = useLeaveBalances()
  const { data: holidays } = useHolidays()
  const { data: trips } = useTrips()
  const { settings } = useSettings()
  const createTrip = useCreateTrip()
  const navigate = useNavigate()
  const today = todayKey()
  const [selected, setSelected] = useState<VacationRecommendation | null>(null)
  const [planning, setPlanning] = useState<VacationRecommendation | null>(null)
  const [duration, setDuration] = useState<DurationFilter>('all')
  const [minStars, setMinStars] = useState(0)

  const holidayDates = useMemo(() => new Set((holidays ?? []).map((h) => h.date)), [holidays])
  const weekend = settings?.weekendDays ?? WEEKEND_PRESETS.SAT_SUN

  const remainingLeave = useMemo(
    () =>
      computeAnalytics(
        year,
        balances ?? [],
        trips ?? [],
        new Set((holidays ?? []).map((h) => h.date)),
        settings?.weekendDays ?? WEEKEND_PRESETS.SAT_SUN,
      ).currentBalance,
    [year, balances, trips, holidays, settings],
  )

  // Already-started or past windows can't be planned for anymore — surface
  // what's still ahead, ordered by how soon it starts rather than by raw score.
  const upcoming = useMemo(
    () =>
      recommendations
        .filter((r) => compareDateKeys(r.startDate, today) > 0)
        .slice()
        .sort((a, b) => compareDateKeys(a.startDate, b.startDate)),
    [recommendations, today],
  )

  const visible = useMemo(
    () => upcoming.filter((r) => matchesDuration(r.vacationLength, duration) && r.stars >= minStars),
    [upcoming, duration, minStars],
  )

  const bestPick = useMemo(() => visible.slice().sort((a, b) => b.score - a.score)[0], [visible])
  const nearest = visible[0]
  const filtersActive = duration !== 'all' || minStars > 0

  async function handleCreateTrip(values: TripFormValues) {
    await createTrip.mutateAsync(values)
    setPlanning(null)
    navigate(ROUTES.planning)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="FOR YOU"
        title="Recommendations"
        description={`${remainingLeave} leaves left · ${year}`}
        action={
          <Select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="!h-auto !w-auto rounded-[8px] border-white/[0.04] bg-s1 py-[7px] pr-8 pl-3 font-mono text-[11.5px] font-bold text-t2"
          >
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
      ) : upcoming.length > 0 ? (
        <>
          <motion.div variants={staggerContainer(0.05)} className="grid grid-cols-3 gap-2.5">
            <StatTile label="Picks" value={visible.length} hint="opportunities found" tone="lime" />
            <StatTile
              label="Nearest"
              value={nearest ? diffDays(today, nearest.startDate) : '—'}
              hint={nearest ? `days · ${nearest.name}` : 'None match'}
              tone="blue"
            />
            <StatTile
              label="Best"
              value={bestPick ? `${bestPick.efficiency.toFixed(1)}×` : '—'}
              hint={bestPick ? bestPick.name : 'No picks yet'}
              tone="purple"
            />
          </motion.div>

          <RecommendationFilters
            duration={duration}
            onDurationChange={setDuration}
            minStars={minStars}
            onMinStarsChange={setMinStars}
          />

          {visible.length > 0 ? (
            <motion.div variants={staggerContainer(0.05)} className="flex flex-col gap-2">
              {visible.map((recommendation) => (
                <RecommendationCard
                  key={`${recommendation.startDate}-${recommendation.endDate}`}
                  recommendation={recommendation}
                  onSelect={() => setSelected(recommendation)}
                />
              ))}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <p className="text-sm text-t3">No picks match these filters.</p>
              {filtersActive && (
                <button
                  type="button"
                  onClick={() => {
                    setDuration('all')
                    setMinStars(0)
                  }}
                  className="font-mono text-[11.5px] font-bold text-lime"
                >
                  Reset filters
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={<Icon name="sparkles" className="mx-auto h-8 w-8 text-t3" />}
          title="No recommendations yet"
          description="Add your leave balance and holidays for this year to get personalized vacation ideas."
        />
      )}

      <Sheet open={selected !== null} onClose={() => setSelected(null)} title="Recommendation">
        {selected && (
          <RecommendationDetail
            recommendation={selected}
            onPlan={() => {
              setPlanning(selected)
              setSelected(null)
            }}
          />
        )}
      </Sheet>

      <Sheet open={planning !== null} onClose={() => setPlanning(null)} title="Plan This Trip">
        {planning && (
          <TripForm
            defaultValues={{
              title: planning.name,
              purpose: 'Vacation',
              departureDate: planning.startDate,
              returnDate: planning.endDate,
              mode: 'Train',
              status: 'Planning',
            }}
            holidayDates={holidayDates}
            weekend={weekend}
            onSubmit={(values) => void handleCreateTrip(values)}
            onCancel={() => setPlanning(null)}
            isSubmitting={createTrip.isPending}
          />
        )}
      </Sheet>
    </div>
  )
}
