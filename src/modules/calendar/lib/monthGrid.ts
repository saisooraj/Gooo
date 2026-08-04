import { addDays, daysInMonth, getMonth, getWeekday, startOfMonth } from '@/utils/date'
import type { DateKey } from '@/utils/date'

export interface CalendarCell {
  date: DateKey
  inMonth: boolean
}

/** Builds a full 7-column grid (including leading/trailing days) for a given month. */
export function buildMonthGrid(year: number, month: number): CalendarCell[] {
  const first = startOfMonth(year, month)
  const leadingDays = getWeekday(first)
  const start = addDays(first, -leadingDays)
  const totalDays = leadingDays + daysInMonth(year, month)
  const totalCells = Math.ceil(totalDays / 7) * 7

  const cells: CalendarCell[] = []
  let cursor = start
  for (let i = 0; i < totalCells; i++) {
    cells.push({ date: cursor, inMonth: getMonth(cursor) === month })
    cursor = addDays(cursor, 1)
  }
  return cells
}
