import { motion } from 'motion/react'
import { formatDisplay } from '@/utils/date'
import { fadeUp, springSnappy } from '@/lib/motion'
import { bookingLabel } from '../lib/bookingLabel'
import type { VacationRecommendation } from '../types/recommendation.types'

/** Compact list row for a recommendation — tap opens the full breakdown in a Sheet. */
export function RecommendationCard({
  recommendation,
  onSelect,
}: {
  recommendation: VacationRecommendation
  onSelect: () => void
}) {
  const efficiencyLabel = Number.isFinite(recommendation.efficiency)
    ? `${recommendation.efficiency.toFixed(1)}×`
    : '∞'

  return (
    <motion.button
      type="button"
      variants={fadeUp}
      whileHover={{ x: 2, backgroundColor: 'rgba(255,255,255,0.03)' }}
      whileTap={{ scale: 0.98 }}
      transition={springSnappy}
      onClick={onSelect}
      className="rounded-[10px] border border-white/[0.03] bg-bg px-3.5 py-3 text-left"
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="truncate text-[13px] font-semibold text-t1">{recommendation.name}</span>
        <span className="shrink-0 font-mono text-xs font-bold text-lime">{efficiencyLabel}</span>
      </div>
      <div className="flex items-center justify-between gap-2.5">
        <span className="font-mono text-[11px] text-t2">
          {formatDisplay(recommendation.startDate, 'DD MMM')}–{formatDisplay(recommendation.endDate, 'DD MMM')} ·{' '}
          {recommendation.vacationLength}d · {recommendation.leaveUsed} leave
        </span>
        {recommendation.bookingDate && (
          <span className="shrink-0 rounded bg-orange/[0.12] px-[7px] py-0.5 text-[10px] font-bold tracking-[0.3px] text-orange">
            {bookingLabel(recommendation.bookingDate)}
          </span>
        )}
      </div>
    </motion.button>
  )
}
