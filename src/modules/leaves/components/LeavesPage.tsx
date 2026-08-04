import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Sheet } from '@/components/ui/Sheet'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { WEEKEND_PRESETS } from '@/utils/date'
import { useHolidays } from '@/modules/holidays/hooks/useHolidays'
import { useTrips } from '@/modules/trips/hooks/useTrips'
import { useSettings } from '@/modules/settings/hooks/useSettings'
import { computeAnalytics } from '@/modules/analytics/lib/computeAnalytics'
import {
  useCreateLeaveBalance,
  useLeaveBalances,
  useRemoveLeaveBalance,
  useUpdateLeaveBalance,
} from '../hooks/useLeaveBalances'
import { LeaveBalanceCard } from './LeaveBalanceCard'
import { LeaveBalanceForm } from './LeaveBalanceForm'
import { LeaveHero } from './LeaveHero'
import { LeaveTypeTiles } from './LeaveTypeTiles'
import type { LeaveBalanceFormValues } from '../lib/leaveBalance.schema'
import type { LeaveBalance } from '../types/leave.types'

export function LeavesPage() {
  const year = new Date().getFullYear()
  const { data: balances, isLoading: loadingBalances } = useLeaveBalances()
  const { data: holidays, isLoading: loadingHolidays } = useHolidays()
  const { data: trips, isLoading: loadingTrips } = useTrips()
  const { settings } = useSettings()
  const createMutation = useCreateLeaveBalance()
  const updateMutation = useUpdateLeaveBalance()
  const removeMutation = useRemoveLeaveBalance()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<LeaveBalance | null>(null)

  const isLoading = loadingBalances || loadingHolidays || loadingTrips

  const summary = useMemo(
    () =>
      computeAnalytics(
        year,
        balances ?? [],
        trips ?? [],
        new Set((holidays ?? []).map((h) => h.date)),
        settings?.weekendDays ?? WEEKEND_PRESETS.SAT_SUN,
      ),
    [year, balances, trips, holidays, settings],
  )

  const currentYearBalances = useMemo(
    () => (balances ?? []).filter((b) => b.year === year),
    [balances, year],
  )

  const sortedBalances = useMemo(
    () =>
      (balances ?? [])
        .slice()
        .sort((a, b) => b.year - a.year || a.leaveType.localeCompare(b.leaveType)),
    [balances],
  )

  function openCreate() {
    setEditing(null)
    setSheetOpen(true)
  }

  function openEdit(balance: LeaveBalance) {
    setEditing(balance)
    setSheetOpen(true)
  }

  async function handleSubmit(values: LeaveBalanceFormValues) {
    const payload = { ...values, expiryDate: values.expiryDate || null }
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data: payload })
    } else {
      await createMutation.mutateAsync(payload)
    }
    setSheetOpen(false)
  }

  async function handleDelete(balance: LeaveBalance) {
    if (window.confirm(`Delete ${balance.leaveType} (${balance.year})?`)) {
      await removeMutation.mutateAsync(balance.id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-[780px] flex-col gap-[22px]">
      <PageHeader eyebrow="LEAVE MANAGER" title="Your Leave" />

      <LeaveHero year={year} summary={summary} />

      <LeaveTypeTiles balances={currentYearBalances} />

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.04] px-5 py-4">
          <div className="font-mono text-[9px] font-bold tracking-[1.2px] text-t3 uppercase">History</div>
          <button
            type="button"
            onClick={openCreate}
            className="font-mono text-[11.5px] font-bold text-lime"
          >
            + ADD
          </button>
        </div>

        {sortedBalances.length > 0 ? (
          <div className="px-5">
            {sortedBalances.map((balance) => (
              <LeaveBalanceCard
                key={balance.id}
                balance={balance}
                onEdit={() => openEdit(balance)}
                onDelete={() => void handleDelete(balance)}
              />
            ))}
          </div>
        ) : (
          <div className="px-5 py-4">
            <EmptyState
              icon={<Icon name="briefcase" className="mx-auto h-8 w-8 text-t3" />}
              title="No leave balances yet"
              description="Add your first leave type — Earned Leave, Casual Leave, and more."
              action={
                <Button onClick={openCreate} size="sm">
                  Add Leave
                </Button>
              }
            />
          </div>
        )}
      </Card>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editing ? 'Edit Leave' : 'Add Leave'}>
        <LeaveBalanceForm
          defaultValues={editing ?? undefined}
          onSubmit={(values) => void handleSubmit(values)}
          onCancel={() => setSheetOpen(false)}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </Sheet>
    </div>
  )
}
