import { describe, expect, it } from 'vitest'
import { FirebaseError } from 'firebase/app'
import { isFirestoreError } from './errors'

describe('isFirestoreError', () => {
  // Same runtime shape Firestore throws (its own constructor is private in the typings).
  it('recognises Firestore errors by their unprefixed code', () => {
    expect(isFirestoreError(new FirebaseError('unavailable', 'offline'))).toBe(true)
  })

  it('rejects other Firebase errors and plain errors', () => {
    expect(isFirestoreError(new FirebaseError('auth/network-request-failed', 'x'))).toBe(false)
    expect(isFirestoreError(new Error('groq down'))).toBe(false)
  })
})
