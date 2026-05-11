import React from 'react'
import { Control, Controller, FieldErrors, UseFieldArrayRemove, UseFieldArrayUpdate } from 'react-hook-form'
import { Plus, Trash2, Zap, Tag, DollarSign, Users } from 'lucide-react'
import clsx from 'clsx'
import { aiToolProviders, createToolRow, type AISpendFormValues } from '../../lib/spend-form'
import FormField from './FormField'

type ToolRowsProps = {
  control: Control<AISpendFormValues>
  errors: FieldErrors<AISpendFormValues>
  fields: Array<{ fieldId: string } & AISpendFormValues['tools'][number]>
  append: (value: AISpendFormValues['tools'][number]) => void
  remove: UseFieldArrayRemove
  update: UseFieldArrayUpdate<AISpendFormValues, 'tools'>
}

function getToolErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object') return undefined
  if ('message' in error && typeof error.message === 'string') return error.message
  return undefined
}

export default function ToolRows({ control, errors, fields, append, remove, update }: ToolRowsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
          <h3 className="text-sm font-bold text-primary dark:text-white">Your tools</h3>
        </div>
        <button
          type="button"
          onClick={() => append(createToolRow())}
          className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1.5 text-xs font-semibold text-cyan-700 transition-all hover:border-cyan-500/40 hover:bg-cyan-500/15 dark:text-cyan-300"
        >
          <Plus className="h-3 w-3" />
          Add
        </button>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => {
          const rowErrors = errors.tools?.[index]

          return (
            <div
              key={field.fieldId}
              className="rounded-lg border border-surface bg-gradient-to-br from-white to-slate-50 p-4 shadow-[0_10px_26px_rgba(15,23,42,0.05)] backdrop-blur transition-all hover:border-cyan-500/20 dark:border-white/10 dark:from-slate-900/40 dark:to-slate-800/30 dark:hover:border-blue-500/30 dark:shadow-[0_10px_26px_rgba(2,6,23,0.2)]"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5 text-cyan-600 dark:text-blue-400" />
                  <p className="text-xs font-bold uppercase tracking-widest text-cyan-700 dark:text-blue-300">Tool {index + 1}</p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  className={clsx(
                    'inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all',
                    fields.length === 1
                      ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-700/40 dark:text-slate-500'
                      : 'border border-rose-500/20 bg-rose-500/10 text-rose-700 hover:border-rose-500/40 hover:bg-rose-500/20 dark:text-rose-300'
                  )}
                >
                  <Trash2 className="h-3 w-3" />
                  Remove
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <FormField
                  id={`tools.${index}.provider`}
                  label={<div className="flex items-center gap-2"><Zap className="h-4 w-4 text-blue-400" />Provider</div>}
                  error={getToolErrorMessage(rowErrors?.provider)}
                >
                  <Controller
                    control={control}
                    name={`tools.${index}.provider`}
                    render={({ field: providerField }) => (
                      <select
                        {...providerField}
                        id={`tools.${index}.provider`}
                        className="block w-full rounded-xl border border-surface bg-white text-primary shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500"
                      >
                        {aiToolProviders.map((provider) => (
                          <option key={provider} value={provider}>
                            {provider}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </FormField>

                <FormField
                  id={`tools.${index}.toolName`}
                  label={<div className="flex items-center gap-2"><Tag className="h-4 w-4 text-amber-400" />Tool name</div>}
                  error={getToolErrorMessage(rowErrors?.toolName)}
                >
                  <Controller
                    control={control}
                    name={`tools.${index}.toolName`}
                    render={({ field: nameField }) => (
                      <input
                        {...nameField}
                        id={`tools.${index}.toolName`}
                        type="text"
                        className="block w-full rounded-xl border border-surface bg-white text-primary shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        placeholder="e.g. GPT-4.1, Claude Code"
                      />
                    )}
                  />
                </FormField>

                <FormField
                  id={`tools.${index}.monthlySpend`}
                  label={<div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-green-400" />Monthly spend</div>}
                  error={getToolErrorMessage(rowErrors?.monthlySpend)}
                >
                  <Controller
                    control={control}
                    name={`tools.${index}.monthlySpend`}
                    render={({ field: spendField }) => (
                      <input
                        {...spendField}
                        id={`tools.${index}.monthlySpend`}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        className="block w-full rounded-xl border border-surface bg-white text-primary shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        onChange={(event) => spendField.onChange(event.target.value === '' ? '' : Number(event.target.value))}
                      />
                    )}
                  />
                </FormField>

                <FormField
                  id={`tools.${index}.activeSeats`}
                  label={<div className="flex items-center gap-2"><Users className="h-4 w-4 text-purple-400" />Active seats</div>}
                  error={getToolErrorMessage(rowErrors?.activeSeats)}
                >
                  <Controller
                    control={control}
                    name={`tools.${index}.activeSeats`}
                    render={({ field: seatsField }) => (
                      <input
                        {...seatsField}
                        id={`tools.${index}.activeSeats`}
                        type="number"
                        min={1}
                        step={1}
                        className="block w-full rounded-xl border border-surface bg-white text-primary shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        onChange={(event) => seatsField.onChange(event.target.value === '' ? '' : Number(event.target.value))}
                      />
                    )}
                  />
                </FormField>
              </div>

              <div className="mt-6 flex items-center justify-between rounded-xl border border-cyan-500/15 bg-cyan-50 px-4 py-3 text-sm dark:border-blue-500/20 dark:bg-blue-500/10">
                <span className="flex items-center gap-2 text-muted dark:text-slate-300">
                  <Zap className="h-4 w-4 text-cyan-600 dark:text-blue-400" />
                  Auto-saved as you type
                </span>
                <button
                  type="button"
                  onClick={() =>
                    update(index, {
                      id: field.id,
                      provider: field.provider,
                      toolName: field.toolName || field.provider,
                      monthlySpend: field.monthlySpend,
                      activeSeats: field.activeSeats
                    })
                  }
                  className="font-semibold text-cyan-700 transition-colors hover:text-cyan-600 dark:text-blue-300 dark:hover:text-blue-200"
                >
                  Normalize
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}