import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { Sheet } from '@/components/ui/Sheet'
import { cn } from '@/utils/cn'
import { PRIMARY_NAV, SECONDARY_NAV } from './navigation'

export function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isSecondaryActive = SECONDARY_NAV.some((item) => location.pathname.startsWith(item.to))

  return (
    <>
      <nav className="mob-nav safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.04] bg-s1 md:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-between px-1">
          {PRIMARY_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-1 py-2.5 font-mono text-[9px] font-bold tracking-[0.5px] uppercase',
                  isActive ? 'text-lime' : 'text-t3',
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 py-2.5 font-mono text-[9px] font-bold tracking-[0.5px] uppercase',
              isSecondaryActive ? 'text-lime' : 'text-t3',
            )}
          >
            <Icon name="menu" className="h-5 w-5" />
            More
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onClose={() => setMoreOpen(false)} title="More">
        <div className="grid grid-cols-4 gap-3 pb-2">
          {SECONDARY_NAV.map((item) => (
            <button
              key={item.to}
              onClick={() => {
                setMoreOpen(false)
                navigate(item.to)
              }}
              className="flex flex-col items-center gap-2 rounded-2xl border border-white/[0.06] py-4 text-xs font-medium text-t2 active:bg-white/5"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </div>
      </Sheet>
    </>
  )
}
