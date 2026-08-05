import { motion } from 'motion/react'
import { cn } from '@/utils/cn'
import { springSnappy } from '@/lib/motion'

export type TripTab = 'upcoming' | 'past' | 'draft'

const TABS: { id: TripTab; label: string }[] = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' },
  { id: 'draft', label: 'Drafts' },
]

export function TripStatusTabs({ value, onChange }: { value: TripTab; onChange: (tab: TripTab) => void }) {
  return (
    <div className="flex w-fit gap-0.5 rounded-[9px] border border-white/[0.04] bg-s1 p-[3px]">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative rounded-[7px] px-3.5 py-[7px] font-mono text-xs font-bold tracking-[0.3px]',
            value === tab.id ? 'text-t1' : 'text-t3',
          )}
        >
          {value === tab.id && (
            <motion.span
              layoutId="trip-tab-active"
              className="absolute inset-0 rounded-[7px] bg-white/[0.09]"
              transition={springSnappy}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
