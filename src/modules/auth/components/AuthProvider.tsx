import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { subscribeToAuthState } from '@/firebase/auth'
import { ensureUserProfile } from '../api/user.repository'
import { useAuthStore } from '../store/authStore'

export function AuthProvider({ children }: { children: ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    return subscribeToAuthState((user) => {
      setUser(user)
      if (user) void ensureUserProfile(user)
    })
  }, [setUser])

  return <>{children}</>
}
