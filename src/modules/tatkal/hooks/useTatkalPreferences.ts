import { createCollectionHooks } from '@/hooks/createCollectionHooks'
import { tatkalPreferencesRepository } from '../api/tatkalPreferences.repository'

export const {
  useList: useTatkalPreferencesList,
  useCreate: useCreateTatkalPreferences,
  useUpdate: useUpdateTatkalPreferences,
} = createCollectionHooks('tatkalPreferences', tatkalPreferencesRepository)