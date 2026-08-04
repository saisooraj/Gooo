import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

const controlStyles = cn(
  'h-10 w-full rounded-xl border border-white/10 bg-s2 px-3 text-sm text-t1',
  'placeholder:text-t3 focus:border-lime focus:outline-none focus:ring-2 focus:ring-lime/20',
)

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(controlStyles, className)} {...props} />
  },
)

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select ref={ref} className={cn(controlStyles, 'appearance-none', className)} {...props}>
        {children}
      </select>
    )
  },
)

export function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-t2">
      {children}
    </label>
  )
}

export function FieldError({ children }: { children?: string }) {
  if (!children) return null
  return <p className="mt-1 text-xs text-red">{children}</p>
}

export function Field({ label, htmlFor, error, children }: {
  label: string
  htmlFor?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      {children}
      <FieldError>{error}</FieldError>
    </div>
  )
}
