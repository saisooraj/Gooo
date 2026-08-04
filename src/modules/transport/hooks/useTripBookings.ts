import { createCollectionHooks } from '@/hooks/createCollectionHooks'
import { tripBookingRepository } from '../api/tripBooking.repository'

export const {
  useList: useTripBookings,
  useCreate: useCreateTripBooking,
  useUpdate: useUpdateTripBooking,
  useRemove: useRemoveTripBooking,
} = createCollectionHooks('tripBookings', tripBookingRepository)
