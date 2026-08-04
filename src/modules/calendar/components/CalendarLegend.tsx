const ITEMS: { label: string; color: string }[] = [
  { label: 'Recommended', color: '#4ECBA0' },
  { label: 'Holiday', color: '#F5C842' },
  { label: 'Weekend', color: '#7EB8F7' },
  { label: 'Booking opens', color: '#F2844A' },
  { label: 'Tatkal', color: '#FF6B6B' },
  { label: 'Trip', color: '#C4A6FF' },
  { label: 'Past', color: '#3A3630' },
]

export function CalendarLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-t2">
      {ITEMS.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-sm" style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  )
}
