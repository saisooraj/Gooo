import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Select } from '@/components/ui/Field'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { Icon } from '@/components/ui/Icon'
import { Sheet } from '@/components/ui/Sheet'
import { WEEKEND_PRESETS } from '@/utils/date'
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
  const [planning, setPlanning] = useState<VacationRecommendation | null>(null)

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
        description={`${remainingLeave} leaves left · ${year} · Sorted by efficiency`}
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
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((recommendation) => (
            <RecommendationCard
              key={`${recommendation.startDate}-${recommendation.endDate}`}
              recommendation={recommendation}
              onPlan={() => setPlanning(recommendation)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Icon name="sparkles" className="mx-auto h-8 w-8 text-t3" />}
          title="No recommendations yet"
          description="Add your leave balance and holidays for this year to get personalized vacation ideas."
        />
      )}

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
            onSubmit={(values) => void handleCreateTrip(values)}
            onCancel={() => setPlanning(null)}
            isSubmitting={createTrip.isPending}
          />
        )}
      </Sheet>
    </div>
  )
}
