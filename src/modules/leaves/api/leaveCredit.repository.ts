import { FirestoreRepository } from '@/firebase/repository'
import { COLLECTIONS } from '@/constants/collections'
import type { LeaveCredit } from '../types/leave.types'

export const leaveCreditRepository = new FirestoreRepository<LeaveCredit>(
  COLLECTIONS.leaveCredits,
)
