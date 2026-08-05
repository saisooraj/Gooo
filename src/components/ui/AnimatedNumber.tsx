import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useMotionValue, useMotionValueEvent } from 'motion/react'
import { cn } from '@/utils/cn'

/** Leading numeric run of a string, e.g. "2.3×" -> 2.3, "×"; "—" -> null. */
function splitLeadingNumber(raw: string): { number: number; suffix: string } | null {
  const match = /^(-?\d+(?:\.\d+)?)(.*)$/.exec(raw.trim())
  if (!match) return null
  return { number: Number(match[1]), suffix: match[2] ?? '' }
}

/** Counts up from 0 to `value` once it scrolls into view. Accepts the same loose `string | number` shape used across StatTile-style displays. */
export function AnimatedNumber({
  value,
  className,
  duration = 0.9,
}: {
  value: string | number
  className?: string
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' })

  const parsed = typeof value === 'number' ? { number: value, suffix: '' } : splitLeadingNumber(value)
  const decimals = parsed && !Number.isInteger(parsed.number)
    ? (String(parsed.number).split('.')[1]?.length ?? 0)
    : 0

  const motionValue = useMotionValue(0)
  const [display, setDisplay] = useState(() => (0).toFixed(decimals))

  useMotionValueEvent(motionValue, 'change', (latest) => {
    setDisplay(latest.toFixed(decimals))
  })

  useEffect(() => {
    if (!parsed || !isInView) return
    const controls = animate(motionValue, parsed.number, { duration, ease: [0.16, 1, 0.3, 1] })
    return controls.stop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView, parsed?.number])

  if (!parsed) {
    return (
      <span ref={ref} className={className}>
        {value}
      </span>
    )
  }

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {display}
      {parsed.suffix}
    </span>
  )
}
