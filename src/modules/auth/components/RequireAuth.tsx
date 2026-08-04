import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { FullScreenLoader } from '@/components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'

export function RequireAuth() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <FullScreenLoader />
  if (!user) return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  return <Outlet />
}
