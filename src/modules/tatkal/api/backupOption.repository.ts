import { FirestoreRepository } from '@/firebase/repository'
import { COLLECTIONS } from '@/constants/collections'
import type { BackupOption } from '../types/tatkal.types'

export const backupOptionRepository = new FirestoreRepository<BackupOption>(
  COLLECTIONS.tatkalBackupOptions,
)