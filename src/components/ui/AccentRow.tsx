import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { fadeUp } from '@/lib/motion'
import { cn } from '@/utils/cn'

/**
 * Colored left-bar list row — the "history"/list-item pattern reused across
 * Leave history, Trips, and Calendar's Upcoming list in the gooo-ui mockup.
 */
export function AccentRow({
  color,
  title,
  meta,
  trailing,
  onClick,
  className,
}: {
  color: string
  title: ReactNode
  meta?: ReactNode
  trailing?: ReactNode
  onClick?: () => void
  className?: string
}) {
  const rowClassName = cn(
    'flex w-full items-center gap-3 border-b border-white/[0.03] py-[13px] text-left last:border-b-0',
    onClick && 'cursor-pointer',
    className,
  )
  const content = (
    <>
      <span className="min-h-[38px] w-[3px] shrink-0 self-stretch rounded-sm" style={{ background: color }} />
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium text-t1">{title}</div>
        {meta && <div className="mt-0.5 font-mono text-[11px] text-t2">{meta}</div>}
      </div>
      {trailing && <div className="flex shrink-0 items-center gap-2">{trailing}</div>}
    </>
  )

  if (onClick) {
    return (
      <motion.button
        variants={fadeUp}
        onClick={onClick}
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.99 }}
        className={rowClassName}
      >
        {content}
      </motion.button>
    )
  }

  return (
    <motion.div variants={fadeUp} className={rowClassName}>
      {content}
    </motion.div>
  )
}
