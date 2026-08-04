import type { SVGProps } from 'react'

/**
 * Icon markup copied verbatim (viewBox + paths) from the gooo-ui mockup's
 * sidebar (18x18) and mobile bottom-nav (20x20) SVGs — the two sets use
 * different stroke weights/sizes so they are kept separate rather than
 * shared with the generic Icon.tsx path set.
 */

export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <path
        d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z"
        fill="#0C0B0A"
        stroke="#0C0B0A"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="2" fill="#0C0B0A" />
    </svg>
  )
}

export function DashboardNavIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" {...props}>
      <rect x="2" y="2" width="6" height="6" rx="1.5" fill="currentColor" />
      <rect x="10" y="2" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5" />
      <rect x="2" y="10" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5" />
      <rect x="10" y="10" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

export function RecommendationsNavIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" {...props}>
      <path
        d="M9 2L11.2 7H17L12.5 10L14.5 15.5L9 12L3.5 15.5L5.5 10L1 7H6.8L9 2Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function CalendarNavIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" {...props}>
      <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <path d="M2 7.5h14" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 2v2M12 2v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function PlanningNavIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" {...props}>
      <rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <path d="M6 2v14" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 6h4M2 10h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function LeaveNavIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" {...props}>
      <rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <path d="M6 9h6M9 6v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function TatkalNavIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" {...props}>
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <path d="M9 5v4.5l2.5 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function TripsNavIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" {...props}>
      <path
        d="M3 14L6.5 8l5.5 3.5 5-7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

export function AnalyticsNavIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" {...props}>
      <rect x="2" y="10" width="3" height="6" rx="1" fill="currentColor" opacity="0.4" />
      <rect x="7.5" y="6.5" width="3" height="9.5" rx="1" fill="currentColor" opacity="0.65" />
      <rect x="13" y="2" width="3" height="14" rx="1" fill="currentColor" />
    </svg>
  )
}

export function SettingsNavIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" {...props}>
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <path
        d="M9 2v2M9 14v2M2 9h2M14 9h2M4.2 4.2l1.4 1.4M12.4 12.4l1.4 1.4M4.2 13.8l1.4-1.4M12.4 5.6l1.4-1.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Mobile bottom-nav variants (20x20, slightly different markup than the sidebar set). */

export function DashboardMobileIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
      <rect x="2" y="2" width="7" height="7" rx="2" fill="currentColor" />
      <rect x="11" y="2" width="7" height="7" rx="2" fill="currentColor" opacity="0.5" />
      <rect x="2" y="11" width="7" height="7" rx="2" fill="currentColor" opacity="0.5" />
      <rect x="11" y="11" width="7" height="7" rx="2" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

export function CalendarMobileIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
      <rect x="2" y="3" width="16" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M2 8h16" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 2v3M13 2v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function RecommendationsMobileIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
      <path
        d="M10 2L12.5 8H19L14 11.5L16.5 18.5L10 14.5L3.5 18.5L6 11.5L1 8H7.5L10 2Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function TripsMobileIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
      <path
        d="M3 16L7 9l5.5 4 6-9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

export function LeaveMobileIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
      <rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M7 10h6M10 7v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
