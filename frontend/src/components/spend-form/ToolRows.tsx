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
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Your tools</h3>
        </div>
        <button
          type="button"
          onClick={() => append(createToolRow())}
          className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1.5 text-xs font-semibold text-blue-300 transition-all hover:bg-blue-500/20 hover:border-blue-500/50 whitespace-nowrap"
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
              className="rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/30 p-4 hover:border-blue-500/30 transition-all backdrop-blur"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5 text-blue-400" />
                  <p className="text-xs font-bold text-blue-300 uppercase tracking-widest">Tool {index + 1}</p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  className={clsx(
                    'inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all',
                    fields.length === 1
                      ? 'cursor-not-allowed bg-slate-700/40 text-slate-500'
                      : 'bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/40'
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
                  error={getToolErrorMessage(rowErrors?.provider)}>
                  <Controller
                    control={control}
                    name={`tools.${index}.provider`}
                    render={({ field: providerField }) => (
                      <select
                        {...providerField}
                        id={`tools.${index}.provider`}
                        className="block w-full rounded-xl border border-slate-600 bg-slate-900 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                  error={getToolErrorMessage(rowErrors?.toolName)}>
                  <Controller
                    control={control}
                    name={`tools.${index}.toolName`}
                    render={({ field: nameField }) => (
                      <input
                        {...nameField}
                        id={`tools.${index}.toolName`}
                        type="text"
                        className="block w-full rounded-xl border border-slate-600 bg-slate-900 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="e.g. GPT-4.1, Claude Code"
                      />
                    )}
                  />
                </FormField>

                <FormField 
                  id={`tools.${index}.monthlySpend`} 
                  label={<div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-green-400" />Monthly spend</div>} 
                  error={getToolErrorMessage(rowErrors?.monthlySpend)}>
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
                        className="block w-full rounded-xl border border-slate-600 bg-slate-900 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        onChange={(event) => spendField.onChange(event.target.value === '' ? '' : Number(event.target.value))}
                      />
                    )}
                  />
                </FormField>

                <FormField 
                  id={`tools.${index}.activeSeats`} 
                  label={<div className="flex items-center gap-2"><Users className="h-4 w-4 text-purple-400" />Active seats</div>} 
                  error={getToolErrorMessage(rowErrors?.activeSeats)}>
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
                        className="block w-full rounded-xl border border-slate-600 bg-slate-900 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        onChange={(event) => seatsField.onChange(event.target.value === '' ? '' : Number(event.target.value))}
                      />
                    )}
                  />
                </FormField>
              </div>

              <div className="mt-6 flex items-center justify-between rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm">
                <span className="text-slate-300 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-400" />
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
                  className="font-semibold text-blue-300 hover:text-blue-200 transition-colors"
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
