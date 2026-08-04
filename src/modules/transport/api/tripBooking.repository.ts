import { FirestoreRepository } from '@/firebase/repository'
import { COLLECTIONS } from '@/constants/collections'
import type { TripBooking } from '../types/transport.types'

export const tripBookingRepository = new FirestoreRepository<TripBooking>(
  COLLECTIONS.tripBookings,
)
