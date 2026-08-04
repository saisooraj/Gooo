import { createCollectionHooks } from '@/hooks/createCollectionHooks'
import { recommendationRepository } from '../api/recommendation.repository'

export const {
  useList: useSavedRecommendations,
  useCreate: useCreateRecommendation,
  useUpdate: useUpdateRecommendation,
  useRemove: useRemoveRecommendation,
} = createCollectionHooks('recommendations', recommendationRepository)
