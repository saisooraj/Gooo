import { FirestoreRepository } from '@/firebase/repository'
import { COLLECTIONS } from '@/constants/collections'
import type { TripPreferences } from '../types/settings.types'

export const tripPreferencesRepository = new FirestoreRepository<TripPreferences>(
  COLLECTIONS.tripPreferences,
)
