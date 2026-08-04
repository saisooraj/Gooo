import { createCollectionHooks } from '@/hooks/createCollectionHooks'
import { leaveBalanceRepository } from '../api/leaveBalance.repository'

export const {
  useList: useLeaveBalances,
  useCreate: useCreateLeaveBalance,
  useUpdate: useUpdateLeaveBalance,
  useRemove: useRemoveLeaveBalance,
} = createCollectionHooks('leaveBalances', leaveBalanceRepository)
