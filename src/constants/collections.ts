/** Firestore collection names. Centralized so a rename only happens once. */
export const COLLECTIONS = {
  users: 'users',
  tripPreferences: 'tripPreferences',
  leaveBalances: 'leaveBalances',
  leaveCredits: 'leaveCredits',
  holidays: 'holidays',
  trips: 'trips',
  tripBookings: 'tripBookings',
  recommendations: 'recommendations',
  settings: 'settings',
  tatkalPlans: 'tatkalPlans',
  tatkalBackupOptions: 'tatkalBackupOptions',
  tatkalPreferences: 'tatkalPreferences',
} as const

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS]
