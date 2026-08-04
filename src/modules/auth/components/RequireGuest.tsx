import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { FullScreenLoader } from '@/components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'

/** Keeps signed-in users out of guest-only routes like /login. */
export function RequireGuest() {
  const { user, isLoading } = useAuth()

  if (isLoading) return <FullScreenLoader />
  if (user) return <Navigate to={ROUTES.dashboard} replace />
  return <Outlet />
}
