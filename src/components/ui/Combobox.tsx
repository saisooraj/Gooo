import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/utils/cn'
import { Input } from './Field'

export interface ComboboxOption {
  value: string
  label: string
  sublabel?: string
}

const MAX_RESULTS = 50

/** Free-text input with a filtered, scrollable suggestion panel — not a strict select, the typed value is always the source of truth. */
export function Combobox({
  id,
  value,
  onChange,
  onSelect,
  options,
  placeholder,
}: {
  id?: string
  value: string
  onChange: (value: string) => void
  /** Called when a suggestion is picked; falls back to onChange(option.value) if omitted. */
  onSelect?: (option: ComboboxOption) => void
  options: ComboboxOption[]
  placeholder?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    const query = value.trim().toLowerCase()
    if (!query) return []
    return options
      .filter((o) => o.label.toLowerCase().includes(query) || o.value.toLowerCase().includes(query))
      .slice(0, MAX_RESULTS)
  }, [value, options])

  useEffect(() => setHighlightedIndex(0), [value])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function selectOption(option: ComboboxOption) {
    if (onSelect) {
      onSelect(option)
    } else {
      onChange(option.value)
    }
    setIsOpen(false)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || filtered.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const option = filtered[highlightedIndex]
      if (option) selectOption(option)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => {
          onChange(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
      />
      <AnimatePresence>
        {isOpen && filtered.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-white/10 bg-s2 p-1 shadow-lg shadow-black/40"
          >
            {filtered.map((option, index) => (
              <li key={option.value}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectOption(option)}
                  className={cn(
                    'flex w-full flex-col rounded-lg px-2.5 py-1.5 text-left transition-colors',
                    index === highlightedIndex ? 'bg-lime/10 text-lime' : 'text-t1 hover:bg-white/5',
                  )}
                >
                  <span className="text-sm font-medium">{option.label}</span>
                  {option.sublabel && <span className="text-xs text-t3">{option.sublabel}</span>}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
