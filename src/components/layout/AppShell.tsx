import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { MobileTopBar } from './MobileTopBar'
import { CommandPalette } from './CommandPalette'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { pageContainer } from '@/lib/motion'

export function AppShell() {
  const location = useLocation()

  return (
    <div className="flex min-h-svh flex-1 bg-bg text-t1">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-4 pb-24 md:px-9 md:pt-8 md:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageContainer}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -8, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } }}
            >
              <ErrorBoundary key={location.pathname}>
                <Outlet />
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>
        <BottomNav />
      </div>
      <CommandPalette />
    </div>
  )
}
