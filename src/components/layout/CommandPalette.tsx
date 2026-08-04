import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sheet } from '@/components/ui/Sheet'
import { Input } from '@/components/ui/Field'
import { SIDEBAR_NAV } from './navigation'

export const OPEN_COMMAND_PALETTE_EVENT = 'gooo:open-command-palette'

export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_COMMAND_PALETTE_EVENT))
}

/** ⌘K / Ctrl+K jump-to-page palette, backed by the same nav list as the sidebar. */
export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    function onOpenEvent() {
      setOpen(true)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, onOpenEvent)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, onOpenEvent)
    }
  }, [])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const results = useMemo(
    () => SIDEBAR_NAV.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
    [query],
  )

  function go(to: string) {
    setOpen(false)
    navigate(to)
  }

  return (
    <Sheet open={open} onClose={() => setOpen(false)} title="Jump to">
      <Input
        autoFocus
        placeholder="Search pages…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-2"
      />
      <div className="flex flex-col">
        {results.map((item) => (
          <button
            key={item.to}
            type="button"
            onClick={() => go(item.to)}
            className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm text-t1 hover:bg-white/5"
          >
            <item.icon className="h-4 w-4 text-t2" />
            {item.label}
          </button>
        ))}
        {results.length === 0 && <p className="px-2 py-2.5 text-sm text-t3">No pages match “{query}”.</p>}
      </div>
    </Sheet>
  )
}
