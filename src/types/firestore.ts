/**
 * Every Firestore document in this app carries these fields. `userId` is
 * required on every document so security rules can enforce
 * `request.auth.uid == resource.data.userId` uniformly across collections.
 */
export interface FirestoreDocument {
  id: string
  userId: string
  createdAt: string
  updatedAt: string
}

/** Shape accepted when creating a document — server assigns id/timestamps. */
export type NewDocument<T extends FirestoreDocument> = Omit<
  T,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
>

/** Shape accepted when updating a document — everything but identity is optional. */
export type DocumentUpdate<T extends FirestoreDocument> = Partial<
  Omit<T, 'id' | 'userId' | 'createdAt'>
>
