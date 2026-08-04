import { AccentRow } from '@/components/ui/AccentRow'
import { Icon } from '@/components/ui/Icon'
import { formatDisplay, todayKey } from '@/utils/date'
import { computeRemainingBalance, monthsElapsedInYear } from '../lib/leaveCalculations'
import { leaveTypeColor } from '../lib/leaveTypeColor'
import type { LeaveBalance } from '../types/leave.types'

export function LeaveBalanceCard({
  balance,
  onEdit,
  onDelete,
}: {
  balance: LeaveBalance
  onEdit: () => void
  onDelete: () => void
}) {
  const monthsElapsed = monthsElapsedInYear(balance.year, todayKey())
  const remaining = computeRemainingBalance({
    openingBalance: balance.openingBalance,
    monthlyCredit: balance.monthlyCredit,
    monthsElapsed,
    leaveUsed: balance.leaveUsed,
    carryForward: balance.carryForward,
  })

  return (
    <AccentRow
      color={leaveTypeColor(balance.leaveType).hex}
      title={`${balance.leaveType} · ${balance.year}`}
      meta={
        <>
          Used {balance.leaveUsed} · Carry fwd {balance.carryForward}
          {balance.expiryDate && <> · Expires {formatDisplay(balance.expiryDate)}</>}
        </>
      }
      trailing={
        <>
          <span className="font-mono text-xs font-bold text-t2">{remaining}d</span>
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit"
            className="flex h-7 w-7 items-center justify-center rounded-md text-t3 hover:bg-white/5 hover:text-t2"
          >
            <Icon name="settings" className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete"
            className="flex h-7 w-7 items-center justify-center rounded-md text-t3 hover:bg-red/10 hover:text-red"
          >
            <Icon name="close" className="h-3.5 w-3.5" />
          </button>
        </>
      }
    />
  )
}
