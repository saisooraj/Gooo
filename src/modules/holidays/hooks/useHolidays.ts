import { createCollectionHooks } from '@/hooks/createCollectionHooks'
import { holidayRepository } from '../api/holiday.repository'

export const {
  useList: useHolidays,
  useCreate: useCreateHoliday,
  useUpdate: useUpdateHoliday,
  useRemove: useRemoveHoliday,
} = createCollectionHooks('holidays', holidayRepository)
