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
  // slightly larger padding for compact mode to avoid text hugging card corners
  const outerPadding = compact ? 'p-3' : 'p-4'
  const titleClass = compact ? 'text-[10px]' : 'text-[11px]'
  const valueClass = compact ? 'text-lg' : 'text-xl'
  const descClass = compact ? 'text-[11px]' : 'text-xs'

  return (
    <div className={`rounded-[1.25rem] border border-white/10 bg-white/5 ${outerPadding} ${className}`}>
      <div className="flex items-center gap-2 text-slate-300">
        {icon && <div className="shrink-0">{icon}</div>}
        <p className={`${titleClass} font-bold uppercase tracking-[0.16em] leading-tight text-slate-400`}>{title}</p>
      </div>
      <div className="mt-2">
        <div className={`${valueClass} font-black text-white`}>{value}</div>
        {description && <p className={`mt-1 ${descClass} leading-5 text-slate-400`}>{description}</p>}
      </div>
    </div>
  )
}
