import type { FirestoreDocument } from '@/types/firestore'
import type { DateKey } from '@/utils/date'

/** Common leave type names — organizations may add their own beyond these. */
export const LEAVE_TYPE_PRESETS = [
  'Earned Leave',
  'Casual Leave',
  'Optional Holiday',
  'Comp Off',
] as const

export type LeaveTypePreset = (typeof LEAVE_TYPE_PRESETS)[number]

/** `leaveBalances` collection — one document per leave type per year. */
export interface LeaveBalance extends FirestoreDocument {
  year: number
  leaveType: string
  openingBalance: number
  monthlyCredit: number
  leaveUsed: number
  carryForward: number
  carryForwardLimit: number
  expiryDate: DateKey | null
}

/** `leaveCredits` collection — a single credit/debit event against a balance. */
export interface LeaveCredit extends FirestoreDocument {
  leaveBalanceId: string
  year: number
  month: number
  amount: number
  creditedOn: DateKey
  note?: string
}

/** A single day of leave taken, as consumed by the recommendation engine. */
export interface LeaveDay {
  date: DateKey
  leaveType: string
}
