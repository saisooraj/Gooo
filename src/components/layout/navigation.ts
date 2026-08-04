import { ROUTES } from '@/constants/routes'
import {
  AnalyticsNavIcon,
  CalendarMobileIcon,
  CalendarNavIcon,
  DashboardMobileIcon,
  DashboardNavIcon,
  LeaveMobileIcon,
  LeaveNavIcon,
  PlanningNavIcon,
  RecommendationsMobileIcon,
  RecommendationsNavIcon,
  SettingsNavIcon,
  TatkalNavIcon,
  TripsMobileIcon,
  TripsNavIcon,
} from './navIcons'
import type { ComponentType, SVGProps } from 'react'

type NavIcon = ComponentType<SVGProps<SVGSVGElement>>

export interface NavItem {
  label: string
  to: string
  icon: NavIcon
}

/** Mobile bottom tab bar — exactly the 5 items shown in the mockup's mob-nav. */
export const PRIMARY_NAV: NavItem[] = [
  { label: 'Home', to: ROUTES.dashboard, icon: DashboardMobileIcon },
  { label: 'Cal', to: ROUTES.calendar, icon: CalendarMobileIcon },
  { label: 'Picks', to: ROUTES.recommendations, icon: RecommendationsMobileIcon },
  { label: 'Trips', to: ROUTES.trips, icon: TripsMobileIcon },
  { label: 'Leave', to: ROUTES.leaves, icon: LeaveMobileIcon },
]

/** Reachable via the mobile "More" sheet — items not in the mockup's mobile nav. */
export const SECONDARY_NAV: NavItem[] = [
  { label: 'Planning', to: ROUTES.planning, icon: PlanningNavIcon },
  { label: 'Tatkal', to: ROUTES.tatkal, icon: TatkalNavIcon },
  { label: 'Analytics', to: ROUTES.analytics, icon: AnalyticsNavIcon },
  { label: 'Settings', to: ROUTES.settings, icon: SettingsNavIcon },
]

/** Desktop icon-rail sidebar — literal DOM order from the mockup. */
export const SIDEBAR_NAV: NavItem[] = [
  { label: 'Dashboard', to: ROUTES.dashboard, icon: DashboardNavIcon },
  { label: 'Recommendations', to: ROUTES.recommendations, icon: RecommendationsNavIcon },
  { label: 'Calendar', to: ROUTES.calendar, icon: CalendarNavIcon },
  { label: 'Planning', to: ROUTES.planning, icon: PlanningNavIcon },
  { label: 'Leave Manager', to: ROUTES.leaves, icon: LeaveNavIcon },
  { label: 'Tatkal Planner', to: ROUTES.tatkal, icon: TatkalNavIcon },
  { label: 'Trips', to: ROUTES.trips, icon: TripsNavIcon },
  { label: 'Analytics', to: ROUTES.analytics, icon: AnalyticsNavIcon },
  { label: 'Settings', to: ROUTES.settings, icon: SettingsNavIcon },
]
