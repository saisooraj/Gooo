import { createCollectionHooks } from '@/hooks/createCollectionHooks'
import { tripRepository } from '../api/trip.repository'

export const {
  useList: useTrips,
  useCreate: useCreateTrip,
  useUpdate: useUpdateTrip,
  useRemove: useRemoveTrip,
} = createCollectionHooks('trips', tripRepository)
