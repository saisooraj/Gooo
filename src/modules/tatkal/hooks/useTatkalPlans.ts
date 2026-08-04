import { createCollectionHooks } from '@/hooks/createCollectionHooks'
import { tatkalPlanRepository } from '../api/tatkalPlan.repository'

export const {
  useList: useTatkalPlans,
  useCreate: useCreateTatkalPlan,
  useUpdate: useUpdateTatkalPlan,
  useRemove: useRemoveTatkalPlan,
} = createCollectionHooks('tatkalPlans', tatkalPlanRepository)