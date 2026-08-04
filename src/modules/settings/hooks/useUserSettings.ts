import { createCollectionHooks } from '@/hooks/createCollectionHooks'
import { userSettingsRepository } from '../api/userSettings.repository'

export const {
  useList: useUserSettingsList,
  useCreate: useCreateUserSettings,
  useUpdate: useUpdateUserSettings,
} = createCollectionHooks('settings', userSettingsRepository)
