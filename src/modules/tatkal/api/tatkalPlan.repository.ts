import { FirestoreRepository } from '@/firebase/repository'
import { COLLECTIONS } from '@/constants/collections'
import type { TatkalPlan } from '../types/tatkal.types'

export const tatkalPlanRepository = new FirestoreRepository<TatkalPlan>(
  COLLECTIONS.tatkalPlans,
)