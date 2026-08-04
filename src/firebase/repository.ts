import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type Firestore,
  type QueryConstraint,
  type QueryDocumentSnapshot,
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
    const snapshot = await getDocs(q)
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
