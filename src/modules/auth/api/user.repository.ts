import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { db } from '@/firebase/firestore'
import { normalizeTimestamp } from '@/firebase/repository'
import { COLLECTIONS } from '@/constants/collections'
import type { UserProfile } from '../types/user.types'

function userRef(userId: string) {
  return doc(db, COLLECTIONS.users, userId)
}

/** Creates the user's profile document on first sign-in; a no-op afterwards. */
export async function ensureUserProfile(user: User): Promise<void> {
  const snapshot = await getDoc(userRef(user.uid))
  if (snapshot.exists()) return

  await setDoc(userRef(user.uid), {
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(userRef(userId))
  if (!snapshot.exists()) return null

  const data = snapshot.data()
  return {
    id: snapshot.id,
    email: (data.email as string | null) ?? null,
    displayName: (data.displayName as string | null) ?? null,
    photoURL: (data.photoURL as string | null) ?? null,
    createdAt: normalizeTimestamp(data.createdAt),
    updatedAt: normalizeTimestamp(data.updatedAt),
  }
}
