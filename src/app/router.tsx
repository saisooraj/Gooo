import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { RequireAuth } from '@/modules/auth/components/RequireAuth'
import { RequireGuest } from '@/modules/auth/components/RequireGuest'
import { LoginPage } from '@/modules/auth/components/LoginPage'
import { FullScreenLoader } from '@/components/ui/Spinner'
import { ROUTES } from '@/constants/routes'

const DashboardPage = lazy(() =>
  import('@/modules/dashboard/components/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const LeavesPage = lazy(() =>
  import('@/modules/leaves/components/LeavesPage').then((m) => ({ default: m.LeavesPage })),
)
const TripsPage = lazy(() =>
  import('@/modules/trips/components/TripsPage').then((m) => ({ default: m.TripsPage })),
)
const TatkalPage = lazy(() =>
  import('@/modules/tatkal/components/TatkalPage').then((m) => ({ default: m.TatkalPage })),
)
const RecommendationsPage = lazy(() =>
  import('@/modules/recommendations/components/RecommendationsPage').then((m) => ({
    default: m.RecommendationsPage,
  })),
)
const CalendarPage = lazy(() =>
  import('@/modules/calendar/components/CalendarPage').then((m) => ({ default: m.CalendarPage })),
)
const PlanningPage = lazy(() =>
  import('@/modules/planning/components/PlanningPage').then((m) => ({ default: m.PlanningPage })),
)
const AnalyticsPage = lazy(() =>
  import('@/modules/analytics/components/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })),
)
const SettingsPage = lazy(() =>
  import('@/modules/settings/components/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<FullScreenLoader />}>{element}</Suspense>
}

export const router = createBrowserRouter([
  {
    element: <RequireGuest />,
    children: [{ path: ROUTES.login, element: <LoginPage /> }],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: withSuspense(<DashboardPage />) },
          { path: 'leaves', element: withSuspense(<LeavesPage />) },
          { path: 'trips', element: withSuspense(<TripsPage />) },
          { path: 'tatkal', element: withSuspense(<TatkalPage />) },
          { path: 'recommendations', element: withSuspense(<RecommendationsPage />) },
          { path: 'calendar', element: withSuspense(<CalendarPage />) },
          { path: 'planning', element: withSuspense(<PlanningPage />) },
          { path: 'analytics', element: withSuspense(<AnalyticsPage />) },
          { path: 'settings', element: withSuspense(<SettingsPage />) },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to={ROUTES.dashboard} replace /> },
])
