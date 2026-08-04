import { FirestoreRepository } from '@/firebase/repository'
import { COLLECTIONS } from '@/constants/collections'
import type { Holiday } from '../types/holiday.types'

export const holidayRepository = new FirestoreRepository<Holiday>(COLLECTIONS.holidays)
