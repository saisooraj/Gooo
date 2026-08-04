import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { FirestoreRepository } from '@/firebase/repository'
import type { DocumentUpdate, FirestoreDocument, NewDocument } from '@/types/firestore'
import { useAuth } from '@/modules/auth/hooks/useAuth'

/**
 * Generates the standard set of TanStack Query hooks (list/create/update/remove)
 * for a user-scoped Firestore collection. Every module's `hooks/` folder wires
 * this up once against its repository instead of re-implementing query/mutation
 * boilerplate — this is the one place that logic lives.
 */
export function createCollectionHooks<T extends FirestoreDocument>(
  queryKey: string,
  repository: FirestoreRepository<T>,
) {
  function useList() {
    const { user } = useAuth()
    return useQuery({
      queryKey: [queryKey, user?.uid],
      queryFn: () => repository.listByUser(user?.uid as string),
      enabled: user !== null,
    })
  }

  function useCreate() {
    const { user } = useAuth()
    const client = useQueryClient()
    return useMutation({
      mutationFn: (data: NewDocument<T>) => repository.create(user?.uid as string, data),
      onSuccess: () => client.invalidateQueries({ queryKey: [queryKey, user?.uid] }),
    })
  }

  function useUpdate() {
    const { user } = useAuth()
    const client = useQueryClient()
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: DocumentUpdate<T> }) =>
        repository.update(id, data),
      onSuccess: () => client.invalidateQueries({ queryKey: [queryKey, user?.uid] }),
    })
  }

  function useRemove() {
    const { user } = useAuth()
    const client = useQueryClient()
    return useMutation({
      mutationFn: (id: string) => repository.remove(id),
      onSuccess: () => client.invalidateQueries({ queryKey: [queryKey, user?.uid] }),
    })
  }

  return { useList, useCreate, useUpdate, useRemove }
}
