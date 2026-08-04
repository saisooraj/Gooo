import { FirestoreRepository } from '@/firebase/repository'
import { COLLECTIONS } from '@/constants/collections'
import type { UserSettings } from '../types/settings.types'

export const userSettingsRepository = new FirestoreRepository<UserSettings>(
  COLLECTIONS.settings,
)
