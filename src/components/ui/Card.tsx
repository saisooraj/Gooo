import { motion } from 'motion/react'
import type { HTMLMotionProps } from 'motion/react'
import type { HTMLAttributes } from 'react'
import { fadeUp } from '@/lib/motion'
import { cn } from '@/utils/cn'

export function Card({ className, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      variants={fadeUp}
      className={cn('rounded-[14px] border border-white/[0.04] bg-s1', className)}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-start justify-between gap-3 p-4 pb-2', className)} {...props} />
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-4 pt-2', className)} {...props} />
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-sm font-medium text-t2', className)}
      {...props}
    />
  )
}
