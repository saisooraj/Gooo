/** `users` collection — id is the Firebase Auth uid itself. */
export interface UserProfile {
  id: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  createdAt: string
  updatedAt: string
}
