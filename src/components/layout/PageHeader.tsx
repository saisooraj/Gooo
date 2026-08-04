import type { ReactNode } from 'react'

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="mb-1.5 font-mono text-[9px] font-bold tracking-[1.2px] text-t3 uppercase">
            {eyebrow}
          </div>
        )}
        <h1 className="text-[28px] font-bold tracking-[-0.8px] text-t1">{title}</h1>
        {description && <p className="mt-1 text-[13px] text-t2">{description}</p>}
      </div>
      {action}
    </div>
  )
}
