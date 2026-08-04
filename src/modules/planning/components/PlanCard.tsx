import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { formatDisplay } from '@/utils/date'
import type { DerivedPlan, PlanStatus } from '../lib/derivePlanSteps'

const STATUS_COLOR: Record<PlanStatus, string> = {
  ACTIVE: '#4ECBA0',
  'IN PROGRESS': '#7EB8F7',
  DRAFT: '#F2844A',
}

export function PlanCard({
  plan,
  onEdit,
  onDelete,
}: {
  plan: DerivedPlan
  onEdit: () => void
  onDelete: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const color = STATUS_COLOR[plan.status]
  const { trip } = plan

  return (
    <div className="rounded-[14px] border border-white/[0.04] bg-s1 p-5">
      <div className="mb-3.5 flex items-center justify-between">
        <span
          className="inline-flex items-center rounded px-[7px] py-0.5 font-mono text-[9px] font-bold tracking-[0.5px] uppercase"
          style={{ background: `${color}18`, color }}
        >
          {plan.status}
        </span>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-[22px] w-[22px] items-center justify-center text-t3"
            aria-label="Plan actions"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="2" cy="6" r="1" fill="currentColor" />
              <circle cx="6" cy="6" r="1" fill="currentColor" />
              <circle cx="10" cy="6" r="1" fill="currentColor" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute top-6 right-0 z-10 w-32 overflow-hidden rounded-lg border border-white/10 bg-s2 py-1 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  onEdit()
                }}
                className="block w-full px-3 py-2 text-left text-xs text-t1 hover:bg-white/5"
              >
                Edit trip
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  onDelete()
                }}
                className="block w-full px-3 py-2 text-left text-xs text-red hover:bg-white/5"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="mb-[3px] text-base font-bold tracking-[-0.3px] text-t1">{trip.title}</h3>
      <p className="mb-4 font-mono text-xs text-t2">
        {trip.origin || '—'} → {trip.destination || '—'} · {formatDisplay(trip.departureDate, 'MMM D')}–
        {formatDisplay(trip.returnDate, 'MMM D')}
      </p>

      <div className="mb-3.5 h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full transition-[width]" style={{ width: `${plan.progress}%`, background: color }} />
      </div>

      <div className="flex flex-col gap-[7px]">
        {plan.steps.map((step) => (
          <div key={step.id} className="flex items-center gap-2">
            <span
              className="flex h-[13px] w-[13px] shrink-0 items-center justify-center rounded-[3px] border"
              style={{
                borderColor: step.done ? '#4ECBA0' : 'rgba(255,255,255,0.08)',
                background: step.done ? 'rgba(78,203,160,0.1)' : 'transparent',
              }}
            >
              {step.done && <Icon name="check" className="h-2 w-2 text-green" />}
            </span>
            <span className={`text-xs ${step.done ? 'text-green' : 'text-t3'}`}>{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
