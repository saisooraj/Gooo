import { NavLink } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { SIDEBAR_NAV } from './navigation'
import { LogoMark } from './navIcons'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import { signOut } from '@/firebase/auth'

export function Sidebar() {
  const { user } = useAuth()

  return (
    <aside className="sidebar hidden w-16 min-w-16 shrink-0 flex-col items-center gap-0.5 overflow-hidden border-r border-white/[0.04] bg-s1 py-4 md:flex">
      <div className="mb-[18px] flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-lime">
        <LogoMark />
      </div>

      <nav className="flex flex-1 flex-col items-center gap-0.5">
        {SIDEBAR_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            title={item.label}
            className={({ isActive }) =>
              cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] transition-colors',
                isActive ? 'bg-lime/[0.12] text-lime' : 'text-t3 hover:text-t2',
              )
            }
          >
            <item.icon className="h-[18px] w-[18px]" />
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        title={`${user?.displayName ?? 'Traveler'} · Sign out`}
        onClick={() => void signOut()}
        className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#5B8EF6] to-[#A855F7] text-[13px] font-bold text-white"
      >
        {user?.photoURL ? (
          <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full" referrerPolicy="no-referrer" />
        ) : (
          (user?.displayName?.[0] ?? user?.email?.[0] ?? '?').toUpperCase()
        )}
      </button>
    </aside>
  )
}
