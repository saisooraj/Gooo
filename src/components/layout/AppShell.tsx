import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { MobileTopBar } from './MobileTopBar'
import { CommandPalette } from './CommandPalette'

export function AppShell() {
  return (
    <div className="flex min-h-svh flex-1 bg-bg text-t1">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-4 pb-24 md:px-9 md:pt-8 md:pb-8">
          <Outlet />
        </main>
        <BottomNav />
      </div>
      <CommandPalette />
    </div>
  )
}
