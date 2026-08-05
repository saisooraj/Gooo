import { motion } from 'motion/react'
import { cn } from '@/utils/cn'
import { LogoMark } from '@/components/layout/navIcons'

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-5 w-5 animate-spin text-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function FullScreenLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex min-h-svh flex-1 items-center justify-center bg-bg"
    >
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-lime">
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-2xl bg-lime"
          animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          animate={{ scale: [1, 0.88, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <LogoMark className="h-7 w-7" />
        </motion.div>
      </div>
    </motion.div>
  )
}
