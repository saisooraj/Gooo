import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Query } from 'firebase/firestore'

type Listener = { next: (snap: unknown) => void; error: (e: unknown) => void }
const listeners: Listener[] = []
const unsubscribe = vi.fn()

vi.mock('./firestore', () => ({ db: {} }))
vi.mock('firebase/firestore', async (importOriginal) => ({
  ...(await importOriginal<typeof import('firebase/firestore')>()),
  onSnapshot: (_q: unknown, _opts: unknown, next: Listener['next'], error: Listener['error']) => {
    listeners.push({ next, error })
    return unsubscribe
  },
}))

const { getDocsWhenServerResponds, SERVER_RESPONSE_TIMEOUT_MS } = await import('./repository')
const query = {} as Query

function snapshot(fromCache: boolean) {
  return { metadata: { fromCache }, docs: [] }
}

describe('getDocsWhenServerResponds', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    listeners.length = 0
    unsubscribe.mockClear()
  })
  afterEach(() => vi.useRealTimers())

  it('ignores cache-only snapshots and resolves with the server one', async () => {
    const result = getDocsWhenServerResponds(query)
    const server = snapshot(false)
    listeners[0]!.next(snapshot(true))
    listeners[0]!.next(server)

    await expect(result).resolves.toBe(server)
    expect(unsubscribe).toHaveBeenCalledOnce()
  })

  it('rejects with unavailable when the server never answers', async () => {
    const result = getDocsWhenServerResponds(query)
    listeners[0]!.next(snapshot(true))
    vi.advanceTimersByTime(SERVER_RESPONSE_TIMEOUT_MS)

    await expect(result).rejects.toMatchObject({ code: 'unavailable' })
    expect(unsubscribe).toHaveBeenCalledOnce()
  })

  it('passes listener errors through', async () => {
    const result = getDocsWhenServerResponds(query)
    const denied = Object.assign(new Error('denied'), { code: 'permission-denied' })
    listeners[0]!.error(denied)

    await expect(result).rejects.toBe(denied)
  })
})
