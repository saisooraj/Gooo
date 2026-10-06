import { FirebaseError } from 'firebase/app'

/**
 * `instanceof FirestoreError` is always false: the `FirebaseError` base
 * constructor resets the prototype to its own. Firestore errors are the
 * `FirebaseError`s with unprefixed codes (`unavailable`), unlike Auth/Storage
 * (`auth/...`, `storage/...`).
 */
export function isFirestoreError(error: unknown): error is FirebaseError {
  return error instanceof FirebaseError && !error.code.includes('/')
}
