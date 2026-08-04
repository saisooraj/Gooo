import type { MonthlyVacationDays } from '../lib/monthlyBreakdown'

const MONTH_LABELS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

export function MonthlyBarChart({ months, year }: { months: MonthlyVacationDays[]; year: number }) {
  const max = Math.max(1, ...months.map((m) => m.days))

  return (
    <div className="rounded-[14px] border border-white/[0.04] bg-s1 p-[22px]">
      <div className="mb-[18px] font-mono text-[9px] font-bold tracking-[1.2px] text-t3 uppercase">
        Vacation days by month · {year}
      </div>
      <div className="flex h-[72px] items-end gap-1.5">
        {months.map((m, i) => {
          const pct = m.days > 0 ? Math.max(6, Math.round((m.days / max) * 100)) : 0
          return (
            <div key={m.month} className="flex h-full flex-1 flex-col items-center gap-[5px]">
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-[3px]"
                  style={{
                    height: pct > 0 ? `${pct}%` : '2px',
                    background: m.days > 0 ? 'var(--color-lime)' : 'rgba(255,255,255,0.04)',
                  }}
                />
              </div>
              <div
                className="font-mono text-[8px] font-bold tracking-[0.3px]"
                style={{ color: m.days > 0 ? 'rgba(201,245,60,0.5)' : '#2A2720' }}
              >
                {MONTH_LABELS[i]}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
