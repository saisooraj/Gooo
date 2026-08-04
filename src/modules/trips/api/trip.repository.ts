import { FirestoreRepository } from '@/firebase/repository'
import { COLLECTIONS } from '@/constants/collections'
import type { Trip } from '../types/trip.types'

export const tripRepository = new FirestoreRepository<Trip>(COLLECTIONS.trips)
