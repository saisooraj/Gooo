import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Sheet } from '@/components/ui/Sheet'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { Timeline } from '@/components/ui/Timeline'
import type { TimelineItem } from '@/components/ui/Timeline'
import { addDays, diffDays, formatDisplay, todayKey } from '@/utils/date'
import { useTrips } from '@/modules/trips/hooks/useTrips'
import { useTripBookings } from '@/modules/transport/hooks/useTripBookings'
import { TATKAL_OPEN_TIME } from '../lib/irctcRules'
import { useCreateTatkalPlan, useRemoveTatkalPlan, useUpdateTatkalPlan } from '../hooks/useTatkalPlans'
import { useTatkalDashboard } from '../hooks/useTatkalDashboard'
import { TatkalPlanCard } from './TatkalPlanCard'
import { TatkalPlanForm } from './TatkalPlanForm'
import type { TatkalPlanFormValues } from '../lib/tatkalPlan.schema'
import type { TatkalPlan } from '../types/tatkal.types'

const BUCKET_META: { key: 'today' | 'tomorrow' | 'upcoming' | 'missed' | 'recentlyConfirmed'; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'tomorrow', label: 'Tomorrow' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'missed', label: 'Missed' },
  { key: 'recentlyConfirmed', label: 'Recently Confirmed' },
]

const PRO_TIPS = [
  'Open IRCTC at 9:50 AM. Pre-fill passenger details the night before.',
  'High-demand routes sell out in under 2 minutes — have a backup ready.',
  "No refund on cancellation — book only when you're certain.",
]

export function TatkalPage() {
  const { data: trips } = useTrips()
  const { data: bookings } = useTripBookings()
  const createMutation = useCreateTatkalPlan()
  const updateMutation = useUpdateTatkalPlan()
  const removeMutation = useRemoveTatkalPlan()
  const { buckets, backupsByPlanId, tripById, isLoading } = useTatkalDashboard()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<TatkalPlan | null>(null)

  const tripList = trips ?? []
  const today = todayKey()

  function openCreate() {
    setEditing(null)
    setSheetOpen(true)
  }

  function openEdit(plan: TatkalPlan) {
    setEditing(plan)
    setSheetOpen(true)
  }

  async function handleSubmit(values: TatkalPlanFormValues) {
    const payload = {
      ...values,
      tripBookingId: values.tripBookingId || undefined,
      currentWlNumber: values.currentWlNumber || undefined,
      currentRacNumber: values.currentRacNumber || undefined,
      wlHistory: editing?.wlHistory ?? [],
      checklist: editing?.checklist ?? {
        passengerDetailsSaved: false,
        preferredTrainSelected: false,
        boardingStationVerified: false,
        paymentMethodReady: false,
      },
    }
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data: payload })
    } else {
      await createMutation.mutateAsync(payload)
    }
    setSheetOpen(false)
  }

  async function handleDelete(plan: TatkalPlan) {
    if (window.confirm('Delete this Tatkal plan?')) {
      await removeMutation.mutateAsync(plan.id)
    }
  }

  const totalPlans =
    buckets.today.length +
    buckets.tomorrow.length +
    buckets.upcoming.length +
    buckets.missed.length +
    buckets.recentlyConfirmed.length

  const upcomingPlans = useMemo(
    () => [...buckets.today, ...buckets.tomorrow, ...buckets.upcoming].slice(0, 5),
    [buckets],
  )

  const nextWindow = upcomingPlans[0]

  const windowItems = useMemo<TimelineItem[]>(
    () =>
      upcomingPlans.map((plan) => {
        const opensOn = addDays(plan.journeyDate, -1)
        const trip = tripById.get(plan.tripId)
        const daysUntil = diffDays(today, opensOn)
        return {
          id: plan.id,
          color: '#C4A6FF',
          dateBox: { month: formatDisplay(opensOn, 'MMM').toUpperCase(), day: formatDisplay(opensOn, 'D') },
          label: (
            <span className="flex items-center gap-2">
              <span>{trip?.title ?? `${plan.boardingStation} → ${plan.destinationStation}`}</span>
              <span className="rounded bg-purple/10 px-[6px] py-0.5 font-mono text-[9px] font-bold tracking-[0.5px] text-purple">
                TATKAL
              </span>
            </span>
          ),
          sub: (
            <>
              {plan.boardingStation} → {plan.destinationStation}
              <br />
              <span className="font-sans text-[11.5px] font-semibold text-orange">
                {daysUntil <= 0 ? 'Opens today' : `${daysUntil} day${daysUntil === 1 ? '' : 's'} away`} ·{' '}
                {TATKAL_OPEN_TIME[plan.tatkalClass]}
              </span>
            </>
          ),
        }
      }),
    [upcomingPlans, tripById, today],
  )

  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-[22px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          eyebrow="TATKAL PLANNER"
          title="Tatkal"
          description="AC: 10:00 AM · Non-AC: 11:00 AM · 1 day before"
        />
        {nextWindow && (
          <div className="rounded-xl border border-purple/20 bg-purple/[0.08] px-[18px] py-3.5 text-center">
            <div className="mb-1 font-mono text-[9px] font-bold tracking-[1px] text-purple">NEXT WINDOW</div>
            <div className="font-mono text-2xl font-bold text-purple">
              {formatDisplay(addDays(nextWindow.journeyDate, -1), 'MMM D')}
            </div>
            <div className="mt-0.5 font-mono text-[11px] text-purple/50">
              {TATKAL_OPEN_TIME[nextWindow.tatkalClass]}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-purple/[0.12] bg-purple/5 px-5 py-4">
        <div className="mb-3.5 font-mono text-[9px] font-bold tracking-[1.2px] text-purple uppercase">
          IRCTC Rules
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <RuleFact label="AC opens" value="10:00 AM" />
          <RuleFact label="Non-AC opens" value="11:00 AM" />
          <RuleFact label="When" value="1 day before" />
          <RuleFact label="AC charge" value="₹300–400" />
          <RuleFact label="SL charge" value="₹100–200" />
          <RuleFact label="Cancellation" value="No refund" tone="red" />
        </div>
      </div>

      {tripList.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={openCreate} size="sm">
            <Icon name="plus" className="h-4 w-4" />
            Add Plan
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : tripList.length === 0 ? (
        <EmptyState
          icon={<Icon name="suitcase" className="mx-auto h-8 w-8 text-t3" />}
          title="Add a trip first"
          description="Tatkal plans are linked to a trip — create one in the Trips tab first."
        />
      ) : totalPlans === 0 ? (
        <EmptyState
          icon={<Icon name="bell" className="mx-auto h-8 w-8 text-t3" />}
          title="No Tatkal plans yet"
          description="Track a train leg's Tatkal window, waitlist movement, and backup options."
          action={
            <Button onClick={openCreate} size="sm">
              Add Plan
            </Button>
          }
        />
      ) : (
        <>
          {windowItems.length > 0 && (
            <div className="rounded-[14px] border border-white/[0.04] bg-s1 px-[22px] py-5">
              <div className="mb-[18px] font-mono text-[9px] font-bold tracking-[1.2px] text-t3 uppercase">
                Upcoming Windows
              </div>
              <Timeline items={windowItems} />
            </div>
          )}

          <div className="flex flex-col gap-6">
            {BUCKET_META.map(({ key, label }) => {
              const plans = buckets[key]
              if (plans.length === 0) return null
              return (
                <section key={key}>
                  <h3 className="mb-2 font-mono text-xs font-medium tracking-wide text-t3 uppercase">
                    {label} ({plans.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {plans.map((plan) => (
                      <TatkalPlanCard
                        key={plan.id}
                        plan={plan}
                        trip={tripById.get(plan.tripId)}
                        backups={backupsByPlanId.get(plan.id) ?? []}
                        onEdit={() => openEdit(plan)}
                        onDelete={() => void handleDelete(plan)}
                      />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        </>
      )}

      <div className="rounded-[14px] border border-white/[0.04] bg-s1 px-[22px] py-5">
        <div className="mb-3.5 font-mono text-[9px] font-bold tracking-[1.2px] text-t3 uppercase">Pro Tips</div>
        <div className="flex flex-col gap-3">
          {PRO_TIPS.map((tip, i) => (
            <div key={tip} className="flex gap-2.5">
              <span className="mt-px shrink-0 font-mono text-xs text-lime">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-[13px] leading-[1.55] text-t2">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editing ? 'Edit Tatkal Plan' : 'Add Tatkal Plan'}
      >
        <TatkalPlanForm
          trips={tripList}
          bookings={bookings ?? []}
          defaultValues={
            editing
              ? {
                  tripId: editing.tripId,
                  tripBookingId: editing.tripBookingId,
                  boardingStation: editing.boardingStation,
                  destinationStation: editing.destinationStation,
                  journeyDate: editing.journeyDate,
                  reservationOpensOn: editing.reservationOpensOn,
                  tatkalClass: editing.tatkalClass,
                  status: editing.status,
                  demand: editing.demand,
                  currentWlNumber: editing.currentWlNumber,
                  currentRacNumber: editing.currentRacNumber,
                  notes: editing.notes,
                }
              : undefined
          }
          onSubmit={(values) => void handleSubmit(values)}
          onCancel={() => setSheetOpen(false)}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </Sheet>
    </div>
  )
}

function RuleFact({ label, value, tone }: { label: string; value: string; tone?: 'red' }) {
  return (
    <div>
      <div className="mb-[3px] text-[10px] text-t3">{label}</div>
      <div className={`font-mono text-[13px] font-semibold ${tone === 'red' ? 'text-red' : 'text-t1'}`}>{value}</div>
    </div>
  )
}
