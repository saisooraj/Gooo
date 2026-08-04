import { Card } from '@/components/ui/Card'
import { cn } from '@/utils/cn'

type Tone = 'lime' | 'blue' | 'orange' | 'purple' | 'green' | 'red' | 'yellow'

const VALUE_TONE: Record<Tone, string> = {
  lime: 'text-lime',
  blue: 'text-blue',
  orange: 'text-orange',
  purple: 'text-purple',
  green: 'text-green',
  red: 'text-red',
  yellow: 'text-yellow',
}

export function StatTile({
  label,
  value,
  hint,
  tone = 'lime',
}: {
  label: string
  value: string | number
  hint?: string
  tone?: Tone
}) {
  return (
    <Card className="px-4 py-[18px]">
      <p className="mb-2.5 font-mono text-[9px] font-bold tracking-[1.2px] text-t3 uppercase">
        {label}
      </p>
      <p
        className={cn(
          'font-mono text-[38px] leading-none font-bold tracking-[-2px]',
          VALUE_TONE[tone],
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-[5px] text-[11px] text-t2">{hint}</p>}
    </Card>
  )
}
