import type { FirestoreDocument } from '@/types/firestore'
import type { DateKey } from '@/utils/date'

export type HolidayCategory = 'Public' | 'Restricted' | 'Company'

/** `holidays` collection. */
export interface Holiday extends FirestoreDocument {
  name: string
  date: DateKey
  category: HolidayCategory
  isMandatory: boolean
  isOptional: boolean
  isRecurring: boolean
  country: string
  state?: string
  organization?: string
}
