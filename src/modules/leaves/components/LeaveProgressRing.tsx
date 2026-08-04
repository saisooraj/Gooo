const SIZE = 90
const RADIUS = 36
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function LeaveProgressRing({
  ratio,
  value,
  label,
}: {
  /** 0–1 */
  ratio: number
  value: number | string
  label: string
}) {
  const clamped = Math.max(0, Math.min(1, ratio))
  const offset = CIRCUMFERENCE * (1 - clamped)

  return (
    <div className="relative h-[90px] w-[90px] shrink-0">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--color-lime)"
          strokeWidth={6}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-mono text-[22px] leading-none font-bold text-lime">{value}</div>
        <div className="font-mono text-[9px] tracking-[0.5px] text-t3">{label}</div>
      </div>
    </div>
  )
}
