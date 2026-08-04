import { createCollectionHooks } from '@/hooks/createCollectionHooks'
import { backupOptionRepository } from '../api/backupOption.repository'

export const {
  useList: useBackupOptions,
  useCreate: useCreateBackupOption,
  useUpdate: useUpdateBackupOption,
  useRemove: useRemoveBackupOption,
} = createCollectionHooks('tatkalBackupOptions', backupOptionRepository)