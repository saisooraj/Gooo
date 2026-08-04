import { Icon } from '@/components/ui/Icon'
import { cn } from '@/utils/cn'
import { checklistProgress, deriveChecklist } from '../lib/backupEngine'
import type { BackupOption, TatkalPlan } from '../types/tatkal.types'

interface ChecklistItem {
  label: string
  done: boolean
  /** When true, this item is derived from backups and can't be toggled directly. */
  derived?: boolean
}

/**
 * Checklist UI. The four stored toggles are editable via `onToggleStored`;
 * the three backup-related items are derived from the BackupOption[] and shown
 * as read-only status indicators.
 */
export function TatkalChecklistPanel({
  plan,
  backups,
  onToggleStored,
}: {
  plan: TatkalPlan
  backups: BackupOption[]
  onToggleStored: (key: keyof TatkalPlan['checklist'], value: boolean) => void
}) {
  const derived = deriveChecklist(plan, backups)
  const { done, total } = checklistProgress(derived)

  const storedItems: { key: keyof TatkalPlan['checklist']; label: string }[] = [
    { key: 'passengerDetailsSaved', label: 'Passenger details saved' },
    { key: 'preferredTrainSelected', label: 'Preferred train selected' },
    { key: 'boardingStationVerified', label: 'Boarding station verified' },
    { key: 'paymentMethodReady', label: 'Payment method ready' },
  ]

  const derivedItems: ChecklistItem[] = [
    { label: 'Backup train added', done: derived.backupTrainAdded, derived: true },
    { label: 'Backup bus added', done: derived.backupBusAdded, derived: true },
    { label: 'Backup flight added', done: derived.backupFlightAdded, derived: true },
  ]

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h4 className="font-mono text-xs font-medium tracking-wide text-t3 uppercase">Checklist</h4>
        <span className="text-xs text-t2">
          {done}/{total}
        </span>
      </div>

      <ul className="flex flex-col gap-1.5">
        {storedItems.map((item) => {
          const checked = plan.checklist[item.key]
          return (
            <li key={item.key}>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-t2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded"
                  checked={checked}
                  onChange={(e) => onToggleStored(item.key, e.target.checked)}
                />
                <span className={cn(checked && 'text-t1')}>{item.label}</span>
              </label>
            </li>
          )
        })}

        {derivedItems.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-sm text-t2">
            <span
              className={cn(
                'flex h-4 w-4 items-center justify-center rounded',
                item.done ? 'bg-green text-bg' : 'border border-white/20 text-transparent',
              )}
            >
              <Icon name="check" className="h-3 w-3" />
            </span>
            <span className={cn(item.done && 'text-t1')}>
              {item.label}
              <span className="ml-1 text-xs text-t3">(derived)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}