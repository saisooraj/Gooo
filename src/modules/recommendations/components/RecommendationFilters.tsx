import { motion } from 'motion/react'
import { springSnappy } from '@/lib/motion'
import { cn } from '@/utils/cn'

export type DurationFilter = 'all' | 'short' | 'medium' | 'long'

const DURATION_OPTIONS: { id: DurationFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'short', label: '≤3d' },
  { id: 'medium', label: '4–5d' },
  { id: 'long', label: '6d+' },
]

export function matchesDuration(vacationLength: number, filter: DurationFilter): boolean {
  switch (filter) {
    case 'short':
      return vacationLength <= 3
    case 'medium':
      return vacationLength >= 4 && vacationLength <= 5
    case 'long':
      return vacationLength >= 6
    default:
      return true
  }
}

/**
 * Duration is a segmented pill group (single choice); rating is a tap-to-set
 * star row rather than a dropdown — tapping a star sets "N★ and up", tapping
 * the active star again clears it. Both read at a glance and take one tap.
 */
export function RecommendationFilters({
  duration,
  onDurationChange,
  minStars,
  onMinStarsChange,
}: {
  duration: DurationFilter
  onDurationChange: (duration: DurationFilter) => void
  minStars: number
  onMinStarsChange: (minStars: number) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex w-fit gap-0.5 rounded-[9px] border border-white/[0.04] bg-s1 p-[3px]">
        {DURATION_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onDurationChange(opt.id)}
            className={cn(
              'relative rounded-[7px] px-3 py-[6px] font-mono text-[11px] font-bold tracking-[0.3px]',
              duration === opt.id ? 'text-t1' : 'text-t3',
            )}
          >
            {duration === opt.id && (
              <motion.span
                layoutId="rec-duration-active"
                className="absolute inset-0 rounded-[7px] bg-white/[0.09]"
                transition={springSnappy}
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1 rounded-[9px] border border-white/[0.04] bg-s1 px-2.5 py-[7px]">
        <span className="mr-0.5 font-mono text-[9px] font-bold tracking-[1.2px] text-t3 uppercase">Min</span>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onMinStarsChange(minStars === n ? 0 : n)}
            aria-label={`${n} star${n > 1 ? 's' : ''} and up`}
            aria-pressed={minStars >= n}
            className={cn(
              'text-sm leading-none transition-colors',
              n <= minStars ? 'text-yellow' : 'text-t3/40 hover:text-t3',
            )}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  )
}
