import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { FirebaseError } from 'firebase/app'
import { DataLoadErrorBanner } from './DataLoadErrorBanner'

function Consumer({ queryFn }: { queryFn: () => Promise<string> }) {
  useQuery({ queryKey: ['data'], queryFn, retry: false })
  return null
}

function renderWith(queryFn: () => Promise<string>) {
  const client = new QueryClient()
  render(
    <QueryClientProvider client={client}>
      <Consumer queryFn={queryFn} />
      <DataLoadErrorBanner />
    </QueryClientProvider>,
  )
}

describe('DataLoadErrorBanner', () => {
  it('shows for a failed Firestore query and clears once a retry succeeds', async () => {
    const queryFn = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new FirebaseError('unavailable', 'offline'))
      .mockResolvedValue('ok')
    renderWith(queryFn)

    await userEvent.click(await screen.findByRole('button', { name: 'Retry' }))

    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
    expect(queryFn).toHaveBeenCalledTimes(2)
  })

  it('ignores failures from non-Firestore queries', async () => {
    const queryFn = vi.fn<() => Promise<string>>().mockRejectedValue(new Error('groq down'))
    renderWith(queryFn)

    await waitFor(() => expect(queryFn).toHaveBeenCalled())
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
