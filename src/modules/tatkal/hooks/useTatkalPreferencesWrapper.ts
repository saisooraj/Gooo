import { useMemo } from 'react'
import type { NewDocument } from '@/types/firestore'
import type { TatkalPreferences } from '../types/tatkal.types'
import {
  useCreateTatkalPreferences,
  useTatkalPreferencesList,
  useUpdateTatkalPreferences,
} from './useTatkalPreferences'

/** `tatkalPreferences` is a single document per user — mirrors useSettings.ts. */
export function useTatkalPreferences() {
  const { data, isLoading } = useTatkalPreferencesList()
  const create = useCreateTatkalPreferences()
  const update = useUpdateTatkalPreferences()
  const preferences = useMemo(() => data?.[0] ?? null, [data])

  async function save(values: NewDocument<TatkalPreferences>) {
    if (preferences) {
      await update.mutateAsync({ id: preferences.id, data: values })
    } else {
      await create.mutateAsync(values)
    }
  }

  return { preferences, isLoading, save, isSaving: create.isPending || update.isPending }
}