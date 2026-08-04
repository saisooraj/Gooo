import { Badge } from '@/components/ui/Badge'
import { computeTatkalWindow, getTatkalCountdownLabel } from '../lib/tatkalWindow'
import type { TatkalWindow } from '../lib/tatkalWindow'
import type { DateKey } from '@/utils/date'
import type { TatkalClass } from '../types/tatkal.types'

const TONE: Record<TatkalWindow['status'], 'neutral' | 'brand' | 'success' | 'warning' | 'danger'> = {
  far: 'neutral',
  upcoming: 'neutral',
  tomorrow: 'warning',
  today: 'danger',
  open: 'success',
  passed: 'neutral',
}

/** Small reusable "Opens in…" badge driven by the Tatkal countdown ladder. */
export function TatkalCountdownBadge({
  journeyDate,
  tatkalClass,
  asOf,
  now,
}: {
  journeyDate: DateKey
  tatkalClass: TatkalClass
  asOf?: DateKey
  now?: Date
}) {
  const window = computeTatkalWindow(journeyDate, tatkalClass, asOf)
  const label = getTatkalCountdownLabel(window, now)
  return <Badge tone={TONE[window.status]}>{label}</Badge>
}