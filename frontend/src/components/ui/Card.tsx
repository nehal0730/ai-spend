import React from 'react'

type Props = React.HTMLAttributes<HTMLDivElement>

export default function Card({ className = '', children, ...rest }: Props) {
  return (
    <div
      className={`rounded-[1.35rem] border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur-sm ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
