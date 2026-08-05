import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { fadeUp, staggerContainer } from '@/lib/motion'

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
    <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="show" className="flex flex-col">
      {items.map((item, i) => (
        <motion.div key={item.id} variants={fadeUp} className="flex gap-3.5">
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
                <motion.span
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  style={{ originY: 0, background: `${item.color}1A` }}
                  className="mt-1 w-px min-h-4 flex-1"
                />
              )}
            </div>
          ) : (
            <div className="flex w-4 shrink-0 flex-col items-center">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                className="mt-[5px] h-2 w-2 shrink-0 rounded-full"
                style={{ background: item.color }}
              />
              {i < items.length - 1 && (
                <motion.span
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  style={{ originY: 0 }}
                  className="mt-[3px] w-px min-h-4 flex-1 bg-white/[0.04]"
                />
              )}
            </div>
          )}
          <div className="min-w-0 flex-1 pb-[18px]">
            <div className="text-[13px] font-medium text-t1">{item.label}</div>
            <div className="mt-0.5 font-mono text-[11.5px] text-t2">{item.sub}</div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
