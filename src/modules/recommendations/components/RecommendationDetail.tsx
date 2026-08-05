import { Button } from '@/components/ui/Button'
import { formatDisplay } from '@/utils/date'
import type { DateKey } from '@/utils/date'
import { bookingLabel, isBookingDatePast } from '../lib/bookingLabel'
import type { VacationRecommendation } from '../types/recommendation.types'

const CHIP_TONE = {
  green: 'bg-green/10 text-green',
  yellow: 'bg-yellow/10 text-yellow',
  blue: 'bg-blue/10 text-blue',
} as const

function DateChipGroup({
  label,
  dates,
  tone,
}: {
  label: string
  dates: DateKey[]
  tone: keyof typeof CHIP_TONE
}) {
  if (dates.length === 0) return null
  return (
    <div>
      <p className="mb-1.5 font-mono text-[9px] font-bold tracking-[1.2px] text-t3 uppercase">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {dates.map((date) => (
          <span
            key={date}
            className={`rounded-[5px] px-[9px] py-1 font-mono text-[11px] font-bold ${CHIP_TONE[tone]}`}
          >
            {formatDisplay(date, 'DD MMM')}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Full breakdown of a single recommendation, shown in a Sheet when a list row is tapped. */
export function RecommendationDetail({
  recommendation,
  onPlan,
}: {
  recommendation: VacationRecommendation
  onPlan: () => void
}) {
  const efficiencyLabel = Number.isFinite(recommendation.efficiency)
    ? `${recommendation.efficiency.toFixed(1)}×`
    : '∞'

  return (
    <div className="flex flex-col gap-4 pb-2">
      <div>
        <h3 className="mb-1 text-[17px] font-bold tracking-[-0.3px] text-t1">{recommendation.name}</h3>
        <p className="font-mono text-xs text-t2">
          {formatDisplay(recommendation.startDate, 'DD MMM')}–{formatDisplay(recommendation.endDate)}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="font-mono text-[32px] leading-none font-bold text-lime">{efficiencyLabel}</div>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-[5px] bg-bg px-[9px] py-1 font-mono text-[11px] font-bold text-t2">
            {recommendation.vacationLength}d total
          </span>
          <span className="rounded-[5px] bg-green/10 px-[9px] py-1 font-mono text-[11px] font-bold text-green">
            {recommendation.leaveUsed} leave used
          </span>
          <span className="rounded-[5px] bg-bg px-[9px] py-1 font-mono text-[11px] font-bold text-t2">
            {'★'.repeat(recommendation.stars)}
          </span>
        </div>
      </div>

      <p className="text-[13px] leading-[1.5] text-t2">{recommendation.reason}</p>

      <div className="flex flex-col gap-3 border-t border-white/5 pt-3.5">
        <DateChipGroup label="Leave days" dates={recommendation.leaveDatesUsed} tone="green" />
        <DateChipGroup label="Holidays" dates={recommendation.holidayDatesUsed} tone="yellow" />
        <DateChipGroup label="Weekend" dates={recommendation.weekendDatesUsed} tone="blue" />
      </div>

      {recommendation.bookingDate && (
        <div className="flex items-center gap-1.5 border-t border-white/5 pt-3.5">
          <span className="h-[5px] w-[5px] shrink-0 animate-pulse rounded-full bg-orange" />
          <span className="text-[11.5px] font-semibold text-orange">
            {bookingLabel(recommendation.bookingDate)}
            {recommendation.returnBookingDate && !isBookingDatePast(recommendation.returnBookingDate) &&
              ` · Return by ${formatDisplay(recommendation.returnBookingDate)}`}
          </span>
        </div>
      )}

      <Button onClick={onPlan} fullWidth>
        Plan This Trip →
      </Button>
    </div>
  )
}
