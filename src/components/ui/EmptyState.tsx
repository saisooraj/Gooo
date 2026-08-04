import type { ReactNode } from 'react'

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center">
      {icon && <div className="text-3xl">{icon}</div>}
      <p className="text-sm font-medium text-t2">{title}</p>
      {description && <p className="max-w-xs text-sm text-t3">{description}</p>}
      {action}
    </div>
  )
}
