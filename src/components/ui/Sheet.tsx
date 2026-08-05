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

  // Without this, a form taller than the viewport (long trips now render a
  // variable-length leave-day checklist) just overflows off the bottom of a
  // short phone screen with no way to reach the Save button. Locking body
  // scroll too keeps the page behind from dragging along with it, which is
  // what every native bottom-sheet does.
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

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
          'safe-bottom relative flex max-h-[85svh] w-full max-w-md flex-col rounded-t-3xl border-t border-white/10 bg-s1 animate-fade-in',
        )}
      >
        <div className="mx-auto mt-4 mb-3 h-1.5 w-10 shrink-0 rounded-full bg-white/15" />
        {title && <h2 className="mb-2 shrink-0 px-4 text-base font-semibold text-t1">{title}</h2>}
        <div className="min-h-0 overflow-y-auto px-4 pb-4">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
