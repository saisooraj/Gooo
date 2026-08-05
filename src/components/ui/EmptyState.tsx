import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { fadeUp, springSoft } from '@/lib/motion'

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={fadeUp}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center"
    >
      {icon && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={springSoft}
          className="text-3xl"
        >
          {icon}
        </motion.div>
      )}
      <p className="text-sm font-medium text-t2">{title}</p>
      {description && <p className="max-w-xs text-sm text-t3">{description}</p>}
      {action}
    </motion.div>
  )
}
