import { FirebaseError } from 'firebase/app'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type Firestore,
  type Query,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type QuerySnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firestore'
import type { DocumentUpdate, FirestoreDocument, NewDocument } from '@/types/firestore'

function hasToDate(value: unknown): value is { toDate: () => Date } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate: unknown }).toDate === 'function'
  )
}

export function normalizeTimestamp(value: unknown): string {
  if (hasToDate(value)) return value.toDate().toISOString()
  return typeof value === 'string' ? value : new Date().toISOString()
}

function fromSnapshot<T extends FirestoreDocument>(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): T {
  const data = snapshot.data()
  return {
    ...data,
    id: snapshot.id,
    createdAt: normalizeTimestamp(data.createdAt),
    updatedAt: normalizeTimestamp(data.updatedAt),
  } as T
}

export const SERVER_RESPONSE_TIMEOUT_MS = 20_000

/**
 * Resolves with the first snapshot that actually came from the server.
 *
 * Firestore flags itself offline after a single failed connect or 10s without
 * one — routine on mobile data and whenever an iOS PWA launches or resumes —
 * then reconnects on its own shortly after. In that window `getDocs` resolves
 * with an empty cache-only snapshot (silently empty pages) and
 * `getDocsFromServer` rejects immediately (spurious load errors). Listening
 * until a server snapshot arrives rides out the reconnect instead, and only
 * gives up when the server genuinely hasn't answered for a while.
 */
export function getDocsWhenServerResponds(q: Query<DocumentData>): Promise<QuerySnapshot<DocumentData>> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      unsubscribe()
      reject(new FirebaseError('unavailable', 'Timed out waiting for a response from Firestore.'))
    }, SERVER_RESPONSE_TIMEOUT_MS)
    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snapshot) => {
        if (snapshot.metadata.fromCache) return
        clearTimeout(timer)
        unsubscribe()
        resolve(snapshot)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

/**
 * Generic Firestore repository (repository pattern): callers work with
 * typed domain models only, never raw snapshots. Every list/subscribe query
 * is scoped to a single owning user, mirroring the `userId` security rules.
 */
export class FirestoreRepository<T extends FirestoreDocument> {
  private readonly collectionName: string
  private readonly firestore: Firestore

  constructor(collectionName: string, firestore: Firestore = db) {
    this.collectionName = collectionName
    this.firestore = firestore
  }

  private collectionRef() {
    return collection(this.firestore, this.collectionName)
  }

  async create(userId: string, data: NewDocument<T>): Promise<string> {
    const ref = await addDoc(this.collectionRef(), {
      ...data,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return ref.id
  }

  async update(id: string, data: DocumentUpdate<T>): Promise<void> {
    await updateDoc(doc(this.firestore, this.collectionName, id), {
      ...data,
      updatedAt: serverTimestamp(),
    })
  }

  async remove(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, this.collectionName, id))
  }

  async getById(id: string): Promise<T | null> {
    const snapshot = await getDoc(doc(this.firestore, this.collectionName, id))
    return snapshot.exists() ? fromSnapshot<T>(snapshot) : null
  }

  async listByUser(userId: string, constraints: QueryConstraint[] = []): Promise<T[]> {
    const q = query(this.collectionRef(), where('userId', '==', userId), ...constraints)
    const snapshot = await getDocsWhenServerResponds(q)
    return snapshot.docs.map((d) => fromSnapshot<T>(d))
  }

  subscribeByUser(
    userId: string,
    onChange: (items: T[]) => void,
    constraints: QueryConstraint[] = [],
  ): Unsubscribe {
    const q = query(this.collectionRef(), where('userId', '==', userId), ...constraints)
    return onSnapshot(q, (snapshot) => {
      onChange(snapshot.docs.map((d) => fromSnapshot<T>(d)))
    })
  }
}

export { limit, orderBy, where } from 'firebase/firestore'
