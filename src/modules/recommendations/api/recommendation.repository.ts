import { FirestoreRepository } from '@/firebase/repository'
import { COLLECTIONS } from '@/constants/collections'
import type { RecommendationDocument } from '../types/recommendation.types'

export const recommendationRepository = new FirestoreRepository<RecommendationDocument>(
  COLLECTIONS.recommendations,
)
