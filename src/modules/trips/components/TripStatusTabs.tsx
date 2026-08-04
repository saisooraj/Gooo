import { cn } from '@/utils/cn'

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
            'rounded-[7px] px-3.5 py-[7px] font-mono text-xs font-bold tracking-[0.3px] transition-colors',
            value === tab.id ? 'bg-white/[0.09] text-t1' : 'text-t3',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
