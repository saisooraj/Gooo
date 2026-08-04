import { Card } from '@/components/ui/Card'
import { LeaveProgressRing } from './LeaveProgressRing'
import type { AnalyticsSummary } from '@/modules/analytics/lib/computeAnalytics'

export function LeaveHero({ year, summary }: { year: number; summary: AnalyticsSummary }) {
  const totalEntitlement = summary.projectedYearEndBalance + summary.consumedLeave
  const ratio = totalEntitlement > 0 ? summary.currentBalance / totalEntitlement : 0

  return (
    <Card className="flex flex-wrap items-center justify-between gap-6 px-7 py-[26px]">
      <div>
        <div className="mb-2 text-xs text-t2">
          FY {year}–{String(year + 1).slice(2)} · Resets April 1
        </div>
        <div className="mb-4 flex items-baseline gap-2.5">
          <span className="font-mono text-[64px] leading-none font-bold tracking-[-3px] text-lime">
            {summary.currentBalance}
          </span>
          <span className="font-mono text-[22px] text-t3">/ {Math.round(totalEntitlement)}</span>
          <span className="text-sm text-t2">days left</span>
        </div>
        <div className="h-1.5 w-[300px] max-w-full overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green to-blue"
            style={{ width: `${Math.max(0, Math.min(100, ratio * 100))}%` }}
          />
        </div>
        <div className="mt-2.5 flex flex-wrap gap-[18px]">
          <span className="text-xs text-t2">
            <span className="text-green">●</span> Used: {summary.consumedLeave}
          </span>
          <span className="text-xs text-t2">
            <span className="text-orange">●</span> Planned: {summary.reservedLeave}
          </span>
          <span className="text-xs text-t2">
            <span className="text-t3">●</span> Available: {Math.max(0, Math.round(summary.availableAfterReservations))}
          </span>
        </div>
      </div>
      <LeaveProgressRing ratio={ratio} value={summary.currentBalance} label="LEFT" />
    </Card>
  )
}
