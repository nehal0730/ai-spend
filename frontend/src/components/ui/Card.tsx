import React from 'react'

type Props = React.HTMLAttributes<HTMLDivElement>

export default function Card({ className = '', children, ...rest }: Props) {
  return (
    <div
      className={`rounded-[1.35rem] bg-surface p-4 shadow-[0_16px_48px_rgba(15,23,42,0.10)] ring-1 ring-slate-200/70 backdrop-blur-sm dark:ring-white/5 ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
