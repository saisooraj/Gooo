import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { cn } from '@/utils/cn'
import { SIDEBAR_NAV } from './navigation'
import { LogoMark } from './navIcons'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import { signOut } from '@/firebase/auth'
import { springSnappy, staggerContainer, scaleIn } from '@/lib/motion'

export function Sidebar() {
  const { user } = useAuth()
  const location = useLocation()
  const [hoveredTo, setHoveredTo] = useState<string | null>(null)

  // The popout label is driven by JS state (not pure CSS :hover) specifically
  // so it can be force-closed here — a plain :hover would stay "on" after a
  // click if the cursor never moves, leaving a stale label floating over the
  // page you just navigated to.
  useEffect(() => {
    setHoveredTo(null)
  }, [location.pathname])

  return (
    <aside className="sidebar sticky top-0 hidden h-svh w-16 min-w-16 shrink-0 flex-col items-center gap-0.5 border-r border-white/[0.04] bg-s1 py-4 md:flex">
      <motion.div
        initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={springSnappy}
        className="mb-[18px] flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-lime"
      >
        <LogoMark />
      </motion.div>

      <motion.nav
        initial="hidden"
        animate="show"
        variants={staggerContainer(0.05)}
        className="flex flex-1 flex-col items-center gap-0.5"
      >
        {SIDEBAR_NAV.map((item) => (
          <motion.div
            key={item.to}
            variants={scaleIn}
            className="relative flex shrink-0 items-center"
            onMouseEnter={() => setHoveredTo(item.to)}
            onMouseLeave={() => setHoveredTo((prev) => (prev === item.to ? null : prev))}
          >
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px]',
                  isActive ? 'text-lime' : 'text-t3 hover:text-t2',
                )
              }
            >
              {({ isActive }) => (
                <motion.span
                  className="flex h-full w-full items-center justify-center"
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.92 }}
                  transition={springSnappy}
                >
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 rounded-[11px] bg-lime/[0.12]"
                      transition={springSnappy}
                    />
                  )}
                  <item.icon className="relative z-10 h-[18px] w-[18px]" />
                </motion.span>
              )}
            </NavLink>

            <span
              aria-hidden
              className={cn(
                'pointer-events-none absolute left-full z-20 ml-3 origin-left rounded-[10px] bg-lime px-3 py-1.5 text-[12px] font-bold whitespace-nowrap text-bg shadow-lg transition-all duration-200',
                hoveredTo === item.to
                  ? 'translate-x-0 scale-100 opacity-100'
                  : '-translate-x-1.5 scale-90 opacity-0',
              )}
            >
              {item.label}
            </span>
          </motion.div>
        ))}
      </motion.nav>

      <div className="group/avatar relative mb-1 flex shrink-0 items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...springSnappy, delay: 0.15 }}
          title={user?.displayName ?? 'Traveler'}
          className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#5B8EF6] to-[#A855F7] text-[13px] font-bold text-white"
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full" referrerPolicy="no-referrer" />
          ) : (
            (user?.displayName?.[0] ?? user?.email?.[0] ?? '?').toUpperCase()
          )}
        </motion.div>

        {/* Grows from zero width in normal flow (not absolutely positioned)
            so there's no dead gap between avatar and button to lose hover
            over while moving the cursor across. */}
        <button
          type="button"
          onClick={() => void signOut()}
          className="ml-0 max-w-0 origin-left overflow-hidden rounded-[10px] bg-lime py-1.5 text-[12px] font-bold whitespace-nowrap text-bg opacity-0 transition-all duration-200 group-hover/avatar:ml-2 group-hover/avatar:max-w-[100px] group-hover/avatar:px-3 group-hover/avatar:opacity-100"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
