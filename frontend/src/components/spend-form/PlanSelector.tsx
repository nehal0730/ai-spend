import React from 'react'
import clsx from 'clsx'
import { CheckCircle2 } from 'lucide-react'
import { planOptions, type PlanOptionValue } from '../../lib/spend-form'

type PlanSelectorProps = {
  value: PlanOptionValue
  error?: string
  onChange: (value: PlanOptionValue) => void
}

export default function PlanSelector({ value, error, onChange }: PlanSelectorProps) {
  return (
    <div className="space-y-3" role="radiogroup" aria-label="Plan selection">
      <div className="grid gap-3 md:grid-cols-3">
        {planOptions.map((plan) => {
          const isSelected = value === plan.value

          return (
            <button
              key={plan.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(plan.value)}
              className={clsx(
                'rounded-2xl border p-4 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-sm dark:border-blue-400 dark:bg-blue-500/10'
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-blue-500/50 dark:hover:bg-slate-800'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-bold text-slate-900 dark:text-white">{plan.label}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{plan.description}</p>
                </div>
                <CheckCircle2
                  className={clsx('mt-0.5 h-5 w-5 transition-opacity', isSelected ? 'opacity-100 text-blue-600 dark:text-blue-400' : 'opacity-0')}
                />
              </div>
            </button>
          )
        })}
      </div>
      {error ? <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{error}</p> : null}
    </div>
  )
}
