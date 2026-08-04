import { useState, type ReactNode } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Sheet } from '@/components/ui/Sheet'
import { signOut } from '@/firebase/auth'
import type { WeekdayIndex } from '@/utils/date'
import { WEEKDAY_NAMES } from '@/utils/date'
import { useTripPreferences } from '../hooks/usePreferences'
import { useSettings } from '../hooks/useSettings'
import { useTatkalPreferences } from '@/modules/tatkal/hooks/useTatkalPreferencesWrapper'
import { TripPreferencesForm } from './TripPreferencesForm'
import { AppSettingsForm } from './AppSettingsForm'
import { DataImportExport } from './DataImportExport'
import { TatkalPreferencesForm } from '@/modules/tatkal/components/TatkalPreferencesForm'
import type { TripPreferencesFormValues } from '../lib/tripPreferences.schema'
import type { AppSettingsFormValues } from '../lib/appSettings.schema'
import type { TatkalPreferencesFormValues } from '@/modules/tatkal/lib/tatkalPlan.schema'

type EditingSheet = 'travel' | 'app' | 'tatkal' | null

export function SettingsPage() {
  const { preferences, save: savePreferences, isSaving: isSavingPreferences } = useTripPreferences()
  const { settings, save: saveSettings, isSaving: isSavingSettings } = useSettings()
  const { preferences: tatkalPrefs, save: saveTatkalPrefs, isSaving: isSavingTatkal } = useTatkalPreferences()

  const [editingSheet, setEditingSheet] = useState<EditingSheet>(null)

  async function handleSavePreferences(values: TripPreferencesFormValues) {
    await savePreferences({
      ...values,
      preferredReturnDay: values.preferredReturnDay as WeekdayIndex,
    })
    setEditingSheet(null)
  }

  async function handleSaveSettings(values: AppSettingsFormValues) {
    await saveSettings({
      ...values,
      weekendDays: values.weekendDays as WeekdayIndex[],
    })
    setEditingSheet(null)
  }

  async function handleSaveTatkal(values: TatkalPreferencesFormValues) {
    await saveTatkalPrefs(values)
    setEditingSheet(null)
  }

  const weekendLabel = (settings?.weekendDays ?? [])
    .map((d) => WEEKDAY_NAMES[d as WeekdayIndex])
    .join(' · ')

  return (
    <div className="mx-auto flex max-w-[640px] flex-col gap-5">
      <PageHeader eyebrow="SETTINGS" title="Settings" />

      <SettingsGroup title="Travel Preferences" onClick={() => setEditingSheet('travel')}>
        <SettingsRow label="Home City" desc="Default departure" value={preferences?.homeCity || '—'} />
        <SettingsRow
          label="Preferred Transport"
          desc="Default mode for new trips"
          value={preferences?.preferredTransport ?? '—'}
        />
        <SettingsRow
          label="Trip Length"
          desc="Preferred number of days"
          value={preferences ? `${preferences.preferredTripLengthDays} days` : '—'}
        />
        <SettingsRow
          label="Booking Window"
          desc="Days before journey"
          value={preferences ? `${preferences.bookingWindowDays} days` : '—'}
        />
      </SettingsGroup>

      <SettingsGroup title="App Settings" onClick={() => setEditingSheet('app')}>
        <SettingsRow label="Weekend Days" desc="Used across recommendations & analytics" value={weekendLabel || '—'} />
        <SettingsRow
          label="Max Continuous Leave"
          desc="Longest single leave stretch"
          value={settings ? `${settings.maxContinuousLeaveDays} days` : '—'}
        />
      </SettingsGroup>

      <SettingsGroup title="Tatkal Preferences" onClick={() => setEditingSheet('tatkal')}>
        <SettingsRow
          label="Tatkal Planning"
          desc="Enable Tatkal-specific tracking"
          value={tatkalPrefs?.enableTatkalPlanning ? 'On' : 'Off'}
        />
        <SettingsRow
          label="Booking Window"
          desc="Default Tatkal advance window"
          value={tatkalPrefs ? `${tatkalPrefs.defaultBookingWindowDays} days` : '—'}
        />
        <SettingsRow
          label="Booking Time"
          desc="Preferred time to book"
          value={tatkalPrefs?.preferredBookingTime || '—'}
        />
        <SettingsRow
          label="High-Demand Alerts"
          desc="Extra alerts for busy routes"
          value={tatkalPrefs?.highDemandAlerts ? 'On' : 'Off'}
        />
      </SettingsGroup>

      <DataImportExport />

      <Button variant="ghost" onClick={() => void signOut()} className="self-start md:hidden">
        <Icon name="logout" className="h-4 w-4" />
        Sign out
      </Button>

      <Sheet open={editingSheet === 'travel'} onClose={() => setEditingSheet(null)} title="Travel Preferences">
        <TripPreferencesForm
          defaultValues={preferences ?? undefined}
          onSubmit={(values) => void handleSavePreferences(values)}
          isSubmitting={isSavingPreferences}
        />
      </Sheet>

      <Sheet open={editingSheet === 'app'} onClose={() => setEditingSheet(null)} title="App Settings">
        <AppSettingsForm
          defaultValues={settings ?? undefined}
          onSubmit={(values) => void handleSaveSettings(values)}
          isSubmitting={isSavingSettings}
        />
      </Sheet>

      <Sheet open={editingSheet === 'tatkal'} onClose={() => setEditingSheet(null)} title="Tatkal Preferences">
        <TatkalPreferencesForm
          defaultValues={tatkalPrefs ?? undefined}
          onSubmit={(values) => void handleSaveTatkal(values)}
          isSubmitting={isSavingTatkal}
        />
      </Sheet>
    </div>
  )
}

function SettingsGroup({ title, onClick, children }: { title: string; onClick: () => void; children: ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-between border-b border-white/[0.04] px-5 py-3 text-left"
      >
        <span className="font-mono text-[9px] font-bold tracking-[1.2px] text-t3 uppercase">{title}</span>
        <span className="text-[11px] font-semibold text-lime">Edit →</span>
      </button>
      <div className="px-5">{children}</div>
    </Card>
  )
}

function SettingsRow({ label, desc, value }: { label: string; desc: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.03] py-[13px] last:border-b-0">
      <div>
        <div className="text-[13.5px] font-medium text-t1">{label}</div>
        <div className="mt-0.5 text-[11.5px] text-t3">{desc}</div>
      </div>
      <div className="ml-4 shrink-0 font-mono text-[12.5px] font-semibold whitespace-nowrap text-t2">{value}</div>
    </div>
  )
}
