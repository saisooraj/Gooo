import { FirestoreRepository } from '@/firebase/repository'
import { COLLECTIONS } from '@/constants/collections'
import type { TatkalPreferences } from '../types/tatkal.types'

export const tatkalPreferencesRepository = new FirestoreRepository<TatkalPreferences>(
  COLLECTIONS.tatkalPreferences,
)