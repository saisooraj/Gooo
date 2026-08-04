import type { ReactNode } from 'react'

export interface TimelineItem {
  id: string
  color: string
  label: ReactNode
  sub: ReactNode
  /** Renders a small "MONTH / DAY" box instead of a plain dot (e.g. Tatkal's upcoming windows). */
  dateBox?: { month: string; day: string }
}

/** Colored dot (or date-box) + connecting line list — used by Dashboard's "What's next" and Tatkal's window list. */
export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="flex flex-col">
      {items.map((item, i) => (
        <div key={item.id} className="flex gap-3.5">
          {item.dateBox ? (
            <div className="flex w-[42px] shrink-0 flex-col items-center">
              <div
                className="flex h-[42px] w-[42px] shrink-0 flex-col items-center justify-center rounded-[10px] border"
                style={{ background: `${item.color}14`, borderColor: `${item.color}2E` }}
              >
                <div className="font-mono text-[7px] font-bold tracking-[0.5px]" style={{ color: `${item.color}80` }}>
                  {item.dateBox.month}
                </div>
                <div className="font-mono text-base leading-[1.1] font-bold" style={{ color: item.color }}>
                  {item.dateBox.day}
                </div>
              </div>
              {i < items.length - 1 && (
                <span className="mt-1 w-px min-h-4 flex-1" style={{ background: `${item.color}1A` }} />
              )}
            </div>
          ) : (
            <div className="flex w-4 shrink-0 flex-col items-center">
              <span className="mt-[5px] h-2 w-2 shrink-0 rounded-full" style={{ background: item.color }} />
              {i < items.length - 1 && <span className="mt-[3px] w-px min-h-4 flex-1 bg-white/[0.04]" />}
            </div>
          )}
          <div className="min-w-0 flex-1 pb-[18px]">
            <div className="text-[13px] font-medium text-t1">{item.label}</div>
            <div className="mt-0.5 font-mono text-[11.5px] text-t2">{item.sub}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
