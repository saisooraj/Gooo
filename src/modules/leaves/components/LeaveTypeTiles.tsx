import { Card } from '@/components/ui/Card'
import { computeAccruedBalance } from '../lib/leaveCalculations'
import { leaveTypeColor } from '../lib/leaveTypeColor'
import type { LeaveBalance } from '../types/leave.types'

export function LeaveTypeTiles({ balances }: { balances: LeaveBalance[] }) {
  if (balances.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {balances.map((balance) => {
        const total = computeAccruedBalance({
          openingBalance: balance.openingBalance,
          monthlyCredit: balance.monthlyCredit,
          monthsElapsed: 12,
          leaveUsed: 0,
          carryForward: balance.carryForward,
        })
        return (
          <Card key={balance.id} className="px-[18px] py-4">
            <div className="mb-2 font-mono text-[9px] font-bold tracking-[1px] text-t3 uppercase">
              {balance.leaveType}
            </div>
            <div className={`font-mono text-[28px] font-bold ${leaveTypeColor(balance.leaveType).text}`}>
              {balance.leaveUsed}
              <span className="text-sm text-t3">/{Math.round(total)}</span>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
