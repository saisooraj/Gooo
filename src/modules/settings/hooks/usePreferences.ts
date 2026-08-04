import { useMemo } from 'react'
import type { NewDocument } from '@/types/firestore'
import type { TripPreferences } from '../types/settings.types'
import {
  useCreateTripPreferences,
  useTripPreferencesList,
  useUpdateTripPreferences,
} from './useTripPreferences'

/**
 * `tripPreferences` is a single document per user. This wraps the generic
 * list/create/update hooks with an upsert so the Settings page doesn't need
 * to know whether a preferences document exists yet.
 */
export function useTripPreferences() {
  const { data, isLoading } = useTripPreferencesList()
  const create = useCreateTripPreferences()
  const update = useUpdateTripPreferences()
  const preferences = useMemo(() => data?.[0] ?? null, [data])

  async function save(values: NewDocument<TripPreferences>) {
    if (preferences) {
      await update.mutateAsync({ id: preferences.id, data: values })
    } else {
      await create.mutateAsync(values)
    }
  }

  return { preferences, isLoading, save, isSaving: create.isPending || update.isPending }
}
