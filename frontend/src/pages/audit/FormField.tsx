import React from 'react'
import clsx from 'clsx'

type FormFieldProps = {
  id: string
  label: React.ReactNode
  hint?: string
  error?: string
  className?: string
  children: React.ReactNode
}

export default function FormField({ id, label, hint, error, className, children }: FormFieldProps) {
  return (
    <div className={clsx('space-y-2', className)}>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
        {label}
      </label>
      {hint ? <p className="text-sm text-slate-500 dark:text-slate-400">{hint}</p> : null}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      ) : null}
    </div>
  )
}