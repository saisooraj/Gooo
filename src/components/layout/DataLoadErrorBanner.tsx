import { useCallback, useState, useSyncExternalStore } from 'react'
import { useQueryClient, type Query } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { isFirestoreError } from '@/firebase/errors'

/**
 * Only Firestore reads count — they're the page's actual data. Groq/RailRadar
 * queries are optional extras with their own fallbacks, so a failure there
 * shouldn't claim the page's data didn't load.
 */
function isFailedDataQuery(query: Query): boolean {
  return (
    query.state.status === 'error' &&
    isFirestoreError(query.state.error) &&
    query.getObserversCount() > 0
  )
}

/**
 * Pages render failed queries as their normal empty states, which is
 * indistinguishable from "you have no data" (e.g. after a dropped mobile
 * connection exhausts its retries). One shared banner for every tab surfaces
 * that and lets the user refetch whatever the current page is showing.
 */
export function DataLoadErrorBanner() {
  const client = useQueryClient()
  const cache = client.getQueryCache()
  const [retrying, setRetrying] = useState(false)

  const subscribe = useCallback((onChange: () => void) => cache.subscribe(onChange), [cache])
  // The code is shown on the banner itself: an installed iOS PWA has no
  // console to check, and "connection" vs "permission" needs different fixes.
  const failureCode = useSyncExternalStore(subscribe, () => {
    const failed = cache.getAll().find(isFailedDataQuery)
    return failed && isFirestoreError(failed.state.error) ? failed.state.error.code : null
  })

  async function retry() {
    setRetrying(true)
    try {
      await client.refetchQueries({ type: 'active', predicate: isFailedDataQuery })
    } finally {
      setRetrying(false)
    }
  }

  return (
    <AnimatePresence>
      {failureCode && (
        <motion.div
          role="alert"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="mb-4 flex items-center justify-between gap-3 rounded-[14px] border border-red/20 bg-red/10 px-4 py-3"
        >
          <div>
            <p className="text-[13px] text-t1">
              {failureCode === 'unavailable'
                ? 'Couldn’t reach the server. Check your connection and try again.'
                : 'Couldn’t load some of your data.'}
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-t3">{failureCode}</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => void retry()} disabled={retrying} className="shrink-0">
            {retrying ? <Spinner className="h-4 w-4" /> : 'Retry'}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
