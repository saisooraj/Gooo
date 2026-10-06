import { QueryClient } from '@tanstack/react-query'
import { isFirestoreError } from '@/firebase/errors'

/**
 * A Firestore `unavailable` already means the server stayed silent for
 * `SERVER_RESPONSE_TIMEOUT_MS` (Firestore reconnects on its own meanwhile), so
 * one more attempt is enough; everything else fails fast.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (isFirestoreError(error) && error.code === 'unavailable') return failureCount < 2
  return failureCount < 1
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: shouldRetry,
    },
  },
})
