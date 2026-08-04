import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Sheet } from '@/components/ui/Sheet'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { compareDateKeys } from '@/utils/date'
import {
  useCreateHoliday,
  useHolidays,
  useRemoveHoliday,
  useUpdateHoliday,
} from '@/modules/holidays/hooks/useHolidays'
import { HolidayForm } from '@/modules/holidays/components/HolidayForm'
import { HolidayListItem } from '@/modules/holidays/components/HolidayListItem'
import type { HolidayFormValues } from '@/modules/holidays/lib/holiday.schema'
import type { Holiday } from '@/modules/holidays/types/holiday.types'

export function ManageHolidaysSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: holidays, isLoading } = useHolidays()
  const createMutation = useCreateHoliday()
  const updateMutation = useUpdateHoliday()
  const removeMutation = useRemoveHoliday()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Holiday | null>(null)

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(holiday: Holiday) {
    setEditing(holiday)
    setFormOpen(true)
  }

  async function handleSubmit(values: HolidayFormValues) {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data: values })
    } else {
      await createMutation.mutateAsync(values)
    }
    setFormOpen(false)
  }

  async function handleDelete(holiday: Holiday) {
    if (window.confirm(`Delete ${holiday.name}?`)) {
      await removeMutation.mutateAsync(holiday.id)
    }
  }

  const sorted = holidays?.slice().sort((a, b) => compareDateKeys(a.date, b.date)) ?? []

  if (formOpen) {
    return (
      <Sheet open={open} onClose={() => setFormOpen(false)} title={editing ? 'Edit Holiday' : 'Add Holiday'}>
        <HolidayForm
          defaultValues={editing ?? undefined}
          onSubmit={(values) => void handleSubmit(values)}
          onCancel={() => setFormOpen(false)}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </Sheet>
    )
  }

  return (
    <Sheet open={open} onClose={onClose} title="Manage Holidays">
      <div className="mb-3 flex justify-end">
        <Button onClick={openCreate} size="sm">
          <Icon name="plus" className="h-4 w-4" />
          Add Holiday
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : sorted.length > 0 ? (
        <div className="flex max-h-[55vh] flex-col overflow-y-auto">
          {sorted.map((holiday) => (
            <HolidayListItem
              key={holiday.id}
              holiday={holiday}
              onEdit={() => openEdit(holiday)}
              onDelete={() => void handleDelete(holiday)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Icon name="sun" className="mx-auto h-8 w-8 text-t3" />}
          title="No holidays added yet"
          description="Add public and company holidays so the recommendation engine can find long weekends."
        />
      )}
    </Sheet>
  )
}
