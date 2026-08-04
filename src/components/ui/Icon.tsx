import type { SVGProps } from 'react'

/**
 * Small, self-contained line-icon set (no external icon package) so the
 * app stays dependency-light. Every icon shares the same 24x24 stroke style.
 */
const PATHS = {
  suitcase: 'M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-9 0h12a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Zm-1 5h14',
  sparkles:
    'M11 4 9.6 8.4 5 9.8l4.6 1.4L11 15.6l1.4-4.4 4.6-1.4-4.6-1.4Zm7 8-.7 2.1-2.1.7 2.1.7.7 2.1.7-2.1 2.1-.7-2.1-.7Z',
  train:
    'M6 3h12a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2Zm-1 14-2 3m14-3 2 3M8 8h8M8 13h.01M16 13h.01',
  sun: 'M12 5V3m0 18v-2M5 12H3m18 0h-2M6.3 6.3 4.9 4.9m14.2 14.2-1.4-1.4M6.3 17.7l-1.4 1.4M17.7 6.3l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
  settings:
    'M10.3 3.4a1.6 1.6 0 0 1 3.4 0l.1.6a1.6 1.6 0 0 0 2.4 1l.5-.3a1.6 1.6 0 0 1 2.4 2.4l-.3.5a1.6 1.6 0 0 0 1 2.4l.6.1a1.6 1.6 0 0 1 0 3.4l-.6.1a1.6 1.6 0 0 0-1 2.4l.3.5a1.6 1.6 0 0 1-2.4 2.4l-.5-.3a1.6 1.6 0 0 0-2.4 1l-.1.6a1.6 1.6 0 0 1-3.4 0l-.1-.6a1.6 1.6 0 0 0-2.4-1l-.5.3a1.6 1.6 0 0 1-2.4-2.4l.3-.5a1.6 1.6 0 0 0-1-2.4l-.6-.1a1.6 1.6 0 0 1 0-3.4l.6-.1a1.6 1.6 0 0 0 1-2.4l-.3-.5a1.6 1.6 0 0 1 2.4-2.4l.5.3a1.6 1.6 0 0 0 2.4-1Zm4.7 8.6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  logout: 'M15 17l5-5-5-5M20 12H9m3 8H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6',
  chevronRight: 'm9 5 7 7-7 7',
  plus: 'M12 5v14M5 12h14',
  check: 'm5 12 4 4L19 7',
  close: 'M6 6l12 12M18 6 6 18',
  bell: 'M6 8a6 6 0 0 1 12 0c0 3.5 1 5 2 6H4c1-1 2-2.5 2-6ZM10 19a2 2 0 0 0 4 0',
  briefcase: 'M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7m-9 0h12a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a1 1 0 0 1 1-1Zm-1 5h14',
  flag: 'M5 3v18M5 4h11l-2 4 2 4H5',
} as const

export type IconName = keyof typeof PATHS

export function Icon({
  name,
  className,
  ...props
}: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
