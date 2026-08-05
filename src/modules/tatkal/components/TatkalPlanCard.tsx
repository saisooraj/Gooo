import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { springSnappy } from '@/lib/motion'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { formatDisplay } from '@/utils/date'
import type { Trip } from '@/modules/trips/types/trip.types'
import { checklistProgress, deriveChecklist } from '../lib/backupEngine'
import { useUpdateTatkalPlan } from '../hooks/useTatkalPlans'
import { TatkalCountdownBadge } from './TatkalCountdownBadge'
import { TatkalStageTimeline } from './TatkalStageTimeline'
import { TatkalChecklistPanel } from './TatkalChecklistPanel'
import { BackupOptionList } from './BackupOptionList'
import type { BackupOption, TatkalPlan } from '../types/tatkal.types'

const STATUS_TONE: Record<TatkalPlan['status'], 'neutral' | 'brand' | 'success' | 'warning' | 'danger'> = {
  Planning: 'neutral',
  'Reservation Pending': 'warning',
  'Reserved Booked': 'success',
  'Waiting List': 'warning',
  RAC: 'warning',
  Confirmed: 'success',
  'Tatkal Planned': 'brand',
  'Tatkal Booked': 'success',
  Cancelled: 'danger',
  Completed: 'neutral',
}

export function TatkalPlanCard({
  plan,
  trip,
  backups,
  onEdit,
  onDelete,
}: {
  plan: TatkalPlan
  trip?: Trip
  backups: BackupOption[]
  onEdit: () => void
  onDelete: () => void
}) {
  const updateMutation = useUpdateTatkalPlan()
  const [expanded, setExpanded] = useState(false)

  const derived = deriveChecklist(plan, backups)
  const { done, total } = checklistProgress(derived)
  const activeBackups = backups.filter((b) => b.status !== 'Rejected').length

  async function handleToggle(key: keyof TatkalPlan['checklist'], value: boolean) {
    await updateMutation.mutateAsync({
      id: plan.id,
      data: { checklist: { ...plan.checklist, [key]: value } },
    })
  }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple/[0.1] text-purple">
            <Icon name="bell" className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-t1">
              {plan.boardingStation} → {plan.destinationStation}
            </p>
            <p className="text-xs text-t2">
              {trip?.title ?? 'Unlinked trip'} · {formatDisplay(plan.journeyDate)}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <TatkalCountdownBadge journeyDate={plan.journeyDate} tatkalClass={plan.tatkalClass} />
          <Badge tone={STATUS_TONE[plan.status]}>{plan.status}</Badge>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-t2">
        <p>Class: {plan.tatkalClass}</p>
        <p>Demand: {plan.demand}</p>
        {typeof plan.currentWlNumber === 'number' && plan.currentWlNumber > 0 && (
          <p>Current WL: {plan.currentWlNumber}</p>
        )}
        {typeof plan.currentRacNumber === 'number' && plan.currentRacNumber > 0 && (
          <p>Current RAC: {plan.currentRacNumber}</p>
        )}
        <p>Backups: {activeBackups} active</p>
        <p>
          Checklist: {done}/{total}
        </p>
      </div>

      {plan.notes && <p className="mt-2 text-xs text-t2">{plan.notes}</p>}

      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Hide details' : 'Details'}
        </Button>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <Button variant="ghost" size="sm" className="text-red" onClick={onDelete}>
          Delete
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={springSnappy}
            className="overflow-hidden"
          >
            <div className="mt-3 flex flex-col gap-4 border-t border-white/10 pt-3">
              <TatkalStageTimeline plan={plan} />
              <TatkalChecklistPanel plan={plan} backups={backups} onToggleStored={handleToggle} />
              <BackupOptionList plan={plan} backups={backups} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}