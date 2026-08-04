import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { cn } from '@/utils/cn'

/** Mobile-native bottom sheet: slides up from the bottom, dismissible via backdrop tap. */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        aria-label="Close"
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px] animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          'safe-bottom relative w-full max-w-md rounded-t-3xl border-t border-white/10 bg-s1 p-4 animate-fade-in',
        )}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-white/15" />
        {title && <h2 className="mb-2 px-1 text-base font-semibold text-t1">{title}</h2>}
        {children}
      </div>
    </div>,
    document.body,
  )
}
