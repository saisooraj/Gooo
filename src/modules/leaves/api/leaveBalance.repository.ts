import { FirestoreRepository } from '@/firebase/repository'
import { COLLECTIONS } from '@/constants/collections'
import type { LeaveBalance } from '../types/leave.types'

export const leaveBalanceRepository = new FirestoreRepository<LeaveBalance>(
  COLLECTIONS.leaveBalances,
)
