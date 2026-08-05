import { motion } from 'motion/react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatDisplay } from '@/utils/date'
import { fadeUp, springSnappy } from '@/lib/motion'
import type { VacationRecommendation } from '../types/recommendation.types'

export function RecommendationCard({
  recommendation,
  onPlan,
  compact = false,
}: {
  recommendation: VacationRecommendation
  onPlan: () => void
  compact?: boolean
}) {
  const efficiencyLabel = Number.isFinite(recommendation.efficiency)
    ? `${recommendation.efficiency.toFixed(1)}×`
    : '∞'

  if (compact) {
    return (
      <motion.button
        type="button"
        variants={fadeUp}
        whileHover={{ x: 2, backgroundColor: 'rgba(255,255,255,0.03)' }}
        whileTap={{ scale: 0.98 }}
        transition={springSnappy}
        onClick={onPlan}
        className="rounded-[10px] border border-white/[0.03] bg-bg px-3.5 py-3 text-left"
      >
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="truncate text-[13px] font-semibold text-t1">{recommendation.name}</span>
          <span className="font-mono text-xs font-bold text-lime">{efficiencyLabel}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[11px] text-t2">
            {recommendation.vacationLength}d · {recommendation.leaveUsed} leave
          </span>
          {recommendation.bookingDate && (
            <span className="rounded bg-orange/[0.12] px-[7px] py-0.5 text-[10px] font-bold tracking-[0.3px] text-orange">
              {formatDisplay(recommendation.bookingDate, 'DD MMM')}
            </span>
          )}
        </div>
      </motion.button>
    )
  }

  return (
    <Card whileHover={{ y: -3 }} transition={springSnappy} className="overflow-hidden">
      <div className="h-0.5 bg-gradient-to-r from-lime to-transparent" />
      <div className="px-5 py-[18px]">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h3 className="mb-[3px] text-[15px] font-bold tracking-[-0.3px] text-t1">
              {recommendation.name}
            </h3>
            <p className="font-mono text-xs text-t2">
              {formatDisplay(recommendation.startDate, 'DD MMM')}–{formatDisplay(recommendation.endDate, 'DD MMM')}
            </p>
          </div>
          <div className="shrink-0 font-mono text-[22px] leading-none font-bold text-lime">
            {efficiencyLabel}
          </div>
        </div>

        <div className="mb-3.5 flex flex-wrap gap-1.5">
          <span className="rounded-[5px] bg-bg px-[9px] py-1 font-mono text-[11px] font-bold text-t2">
            {recommendation.vacationLength}d
          </span>
          <span className="rounded-[5px] bg-green/10 px-[9px] py-1 font-mono text-[11px] font-bold text-green">
            {recommendation.leaveUsed} leave
          </span>
          <span className="rounded-[5px] bg-bg px-[9px] py-1 font-mono text-[11px] font-bold text-t2">
            {'★'.repeat(recommendation.stars)}
          </span>
        </div>

        <p className="mb-3.5 text-[13px] leading-[1.5] text-t2">{recommendation.reason}</p>

        <div className="flex items-center justify-between border-t border-white/5 pt-3">
          {recommendation.bookingDate ? (
            <div className="flex items-center gap-1.5">
              <span className="h-[5px] w-[5px] animate-pulse rounded-full bg-orange" />
              <span className="text-[11.5px] font-semibold text-orange">
                Book by {formatDisplay(recommendation.bookingDate)}
              </span>
            </div>
          ) : (
            <span />
          )}
          <Button variant="ghost" size="sm" className="!h-auto !p-0 font-mono text-[11.5px] font-bold text-lime" onClick={onPlan}>
            PLAN →
          </Button>
        </div>
      </div>
    </Card>
  )
}
