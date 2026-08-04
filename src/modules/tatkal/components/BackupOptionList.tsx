import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Sheet } from '@/components/ui/Sheet'
import { rankBackupOptions } from '../lib/backupEngine'
import { useCreateBackupOption, useRemoveBackupOption, useUpdateBackupOption } from '../hooks/useBackupOptions'
import { BackupOptionForm } from './BackupOptionForm'
import type { BackupOptionFormValues } from '../lib/tatkalPlan.schema'
import type { BackupOption, TatkalPlan } from '../types/tatkal.types'

const STATUS_TONE: Record<BackupOption['status'], 'neutral' | 'brand' | 'success' | 'danger'> = {
  Suggested: 'neutral',
  Added: 'brand',
  Booked: 'success',
  Rejected: 'danger',
}

function optionLabel(o: BackupOption): string {
  if (o.mode === 'Train') return o.trainName || o.trainNumber || 'Train backup'
  if (o.mode === 'Flight') return o.airline || o.flightNumber || 'Flight backup'
  return o.operator || 'Bus backup'
}

/**
 * Manages the ranked fallback options for a plan. Add/edit happens in a Sheet,
 * mirroring TripBookingForm. The list is always rendered via rankBackupOptions
 * so priority ordering is consistent with the engine.
 */
export function BackupOptionList({ plan, backups }: { plan: TatkalPlan; backups: BackupOption[] }) {
  const createMutation = useCreateBackupOption()
  const updateMutation = useUpdateBackupOption()
  const removeMutation = useRemoveBackupOption()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<BackupOption | null>(null)

  const ranked = rankBackupOptions(backups)

  function openCreate() {
    setEditing(null)
    setSheetOpen(true)
  }

  function openEdit(option: BackupOption) {
    setEditing(option)
    setSheetOpen(true)
  }

  async function handleSubmit(values: BackupOptionFormValues) {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data: values })
    } else {
      await createMutation.mutateAsync({ ...values, tatkalPlanId: plan.id })
    }
    setSheetOpen(false)
  }

  async function handleDelete(option: BackupOption) {
    if (window.confirm('Delete this backup option?')) {
      await removeMutation.mutateAsync(option.id)
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h4 className="font-mono text-xs font-medium tracking-wide text-t3 uppercase">Backup options</h4>
        <Button variant="ghost" size="sm" onClick={openCreate}>
          <Icon name="plus" className="h-4 w-4" />
          Add
        </Button>
      </div>

      {ranked.length === 0 ? (
        <p className="text-xs text-t2">No backups yet. Add alternate trains, buses, or flights as fallbacks.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {ranked.map((option) => (
            <li
              key={option.id}
              className="flex items-start justify-between gap-2 rounded-xl border border-white/10 p-2"
            >
              <div>
                <p className="text-sm font-medium text-t1">
                  <span className="text-t3">#{option.priority}</span> {optionLabel(option)}
                </p>
                <p className="text-xs text-t2">
                  {option.mode}
                  {option.boardingStation ? ` · ${option.boardingStation}` : ''}
                  {option.destinationStation ? ` → ${option.destinationStation}` : ''}
                  {option.isAutoSuggested ? ' · auto-suggested' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={STATUS_TONE[option.status]}>{option.status}</Badge>
                <Button variant="ghost" size="sm" onClick={() => openEdit(option)}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-red" onClick={() => void handleDelete(option)}>
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editing ? 'Edit backup option' : 'Add backup option'}
      >
        <BackupOptionForm
          defaultValues={
            editing
              ? {
                  priority: editing.priority,
                  mode: editing.mode,
                  boardingStation: editing.boardingStation,
                  destinationStation: editing.destinationStation,
                  trainNumber: editing.trainNumber,
                  trainName: editing.trainName,
                  operator: editing.operator,
                  airline: editing.airline,
                  flightNumber: editing.flightNumber,
                  status: editing.status,
                  isAutoSuggested: editing.isAutoSuggested,
                  notes: editing.notes,
                }
              : undefined
          }
          onSubmit={(values) => void handleSubmit(values)}
          onCancel={() => setSheetOpen(false)}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </Sheet>
    </div>
  )
}