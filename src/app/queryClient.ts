import { QueryClient } from '@tanstack/react-query'
import { isFirestoreError } from '@/firebase/errors'

/** Transient connectivity failures (common on mobile data) get a few backed-off retries; everything else fails fast. */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (isFirestoreError(error) && error.code === 'unavailable') return failureCount < 4
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
