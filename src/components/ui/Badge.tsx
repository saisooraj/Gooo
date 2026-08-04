import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger'

const toneStyles: Record<Tone, string> = {
  neutral: 'bg-white/[0.06] text-t2',
  brand: 'bg-lime/[0.15] text-lime',
  success: 'bg-green/[0.15] text-green',
  warning: 'bg-orange/[0.15] text-orange',
  danger: 'bg-red/[0.15] text-red',
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}

export function Badge({ className, tone = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-[7px] py-0.5 font-mono text-[9px] font-bold tracking-[0.5px] uppercase',
        toneStyles[tone],
        className,
      )}
      {...props}
    />
  )
}
