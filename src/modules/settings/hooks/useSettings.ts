import { useMemo } from 'react'
import type { NewDocument } from '@/types/firestore'
import type { UserSettings } from '../types/settings.types'
import { useCreateUserSettings, useUpdateUserSettings, useUserSettingsList } from './useUserSettings'

/** `settings` is a single document per user — see useTripPreferences for the same pattern. */
export function useSettings() {
  const { data, isLoading } = useUserSettingsList()
  const create = useCreateUserSettings()
  const update = useUpdateUserSettings()
  const settings = useMemo(() => data?.[0] ?? null, [data])

  async function save(values: NewDocument<UserSettings>) {
    if (settings) {
      await update.mutateAsync({ id: settings.id, data: values })
    } else {
      await create.mutateAsync(values)
    }
  }

  return { settings, isLoading, save, isSaving: create.isPending || update.isPending }
}
