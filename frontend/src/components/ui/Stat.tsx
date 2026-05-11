import React from 'react'
import type { ReactNode } from 'react'

type Props = {
  title: string
  value: ReactNode
  description?: string
  icon?: ReactNode
  className?: string
  compact?: boolean
}

export default function Stat({ title, value, description, icon, className = '', compact = false }: Props) {
  const outerPadding = compact ? 'p-3' : 'p-4'
  const titleClass = compact ? 'text-[10px]' : 'text-[11px]'
  const valueClass = compact ? 'text-lg' : 'text-xl'
  const descClass = compact ? 'text-[11px]' : 'text-xs'

  return (
    <div className={`rounded-[1.25rem] bg-surface ${outerPadding} shadow-[0_12px_34px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 dark:ring-white/5 ${className}`}>
      <div className="flex items-center gap-2 text-muted">
        {icon && <div className="shrink-0">{icon}</div>}
        <p className={`${titleClass} font-bold uppercase tracking-[0.16em] leading-tight text-muted`}>{title}</p>
      </div>
      <div className="mt-2">
        <div className={`${valueClass} font-black text-primary`}>{value}</div>
        {description && <p className={`mt-1 ${descClass} leading-5 text-soft`}>{description}</p>}
      </div>
    </div>
  )
}
