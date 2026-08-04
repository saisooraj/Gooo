import { AccentRow } from '@/components/ui/AccentRow'
import { Icon } from '@/components/ui/Icon'
import { formatDisplay } from '@/utils/date'
import type { Holiday } from '../types/holiday.types'

export function HolidayListItem({
  holiday,
  onEdit,
  onDelete,
}: {
  holiday: Holiday
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <AccentRow
      color="#F5C842"
      title={holiday.name}
      meta={
        <>
          {formatDisplay(holiday.date, 'ddd, DD MMM YYYY')}
          {holiday.state ? ` · ${holiday.state}` : ''} · {holiday.category}
        </>
      }
      trailing={
        <>
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
