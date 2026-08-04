import { createCollectionHooks } from '@/hooks/createCollectionHooks'
import { tripPreferencesRepository } from '../api/tripPreferences.repository'

export const {
  useList: useTripPreferencesList,
  useCreate: useCreateTripPreferences,
  useUpdate: useUpdateTripPreferences,
} = createCollectionHooks('tripPreferences', tripPreferencesRepository)
