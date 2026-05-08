import React, { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Lock, RefreshCcw, Sparkles, TrendingUp, Database, Clock } from 'lucide-react'
import FormField from './FormField'
import PlanSelector from './PlanSelector'
import ToolRows from './ToolRows'
import {
  aiSpendFormSchema,
  defaultAISpendFormValues,
  primaryUseCaseOptions,
  type AISpendFormValues
} from '../../lib/spend-form'
import { useSpendFormStore } from '../../lib/spend-form-store'

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, staggerChildren: 0.08 }
  }
}

function calculateSavings(plan: string, totalSpend: number): number {
  const savingsPercentage = {
    starter: 0.15,
    growth: 0.25,
    enterprise: 0.35
  } as const
  const percentage = savingsPercentage[plan as keyof typeof savingsPercentage] || 0.15
  return Math.round(totalSpend * percentage)
}

function getMostExpensiveTool(tools: AISpendFormValues['tools']): { name: string; spend: number } | null {
  if (tools.length === 0) return null
  return tools.reduce((max, tool) => {
    const toolSpend = Number(tool.monthlySpend || 0)
    const maxSpend = Number(max.monthlySpend || 0)
    return toolSpend > maxSpend ? tool : max
  }, tools[0] as any)
}

function getAuditProgress(tools: AISpendFormValues['tools']): number {
  if (tools.length === 0) return 0
  const completed = tools.filter(t => t.provider && t.toolName && t.monthlySpend).length
  return Math.round((completed / tools.length) * 100)
}

function getTopTools(tools: AISpendFormValues['tools'], limit: number = 3) {
  return tools
    .map(t => ({ name: t.toolName || t.provider || 'Unknown', spend: Number(t.monthlySpend || 0) }))
    .sort((a, b) => b.spend - a.spend)
    .slice(0, limit)
}

function summarizeTools(tools: AISpendFormValues['tools']) {
  const totalSpend = tools.reduce((sum, row) => sum + Number(row.monthlySpend || 0), 0)
  const totalSeats = tools.reduce((sum, row) => sum + Number(row.activeSeats || 0), 0)
  return { totalSpend, totalSeats }
}

export default function SpendInputForm() {
  const draft = useSpendFormStore((state) => state.draft)
  const updatedAt = useSpendFormStore((state) => state.updatedAt)
  const setDraft = useSpendFormStore((state) => state.setDraft)
  const resetDraft = useSpendFormStore((state) => state.resetDraft)

  const form = useForm<AISpendFormValues>({
    resolver: zodResolver(aiSpendFormSchema),
    defaultValues: draft ?? defaultAISpendFormValues,
    mode: 'onChange'
  })

  const { control, register, handleSubmit, setValue, formState, getValues } = form
  const { errors, isSubmitting } = formState

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'tools',
    keyName: 'fieldId'
  })

  const tools = useWatch({ control, name: 'tools' }) ?? defaultAISpendFormValues.tools
  const plan = useWatch({ control, name: 'plan' }) ?? defaultAISpendFormValues.plan

  useEffect(() => {
    const subscription = form.watch(() => {
      const currentValues = getValues()
      const validated = aiSpendFormSchema.safeParse(currentValues)
      if (validated.success) {
        setDraft(validated.data)
        return
      }

      setDraft({
        ...(currentValues as AISpendFormValues),
        tools: currentValues.tools.length > 0 ? currentValues.tools : defaultAISpendFormValues.tools
      })
    })

    return () => subscription.unsubscribe()
  }, [form, getValues, setDraft])

  const summary = useMemo(() => summarizeTools(tools), [tools])
  const estimatedSavings = useMemo(() => calculateSavings(plan, summary.totalSpend), [plan, summary.totalSpend])
  const mostExpensive = useMemo(() => getMostExpensiveTool(tools), [tools])
  const auditProgress = useMemo(() => getAuditProgress(tools), [tools])
  const topTools = useMemo(() => getTopTools(tools, 3), [tools])

  const onSubmit = (values: AISpendFormValues) => {
    setDraft(values)
  }

  return (
    <section id="spend-input-form" className="py-12 md:py-16 lg:py-20 bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.24),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.18),_transparent_24%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(2,6,23,1))]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />

      <div className="container px-4 md:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
          className="grid gap-8 lg:grid-cols-[1.4fr_1fr]"
        >
          <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-2xl shadow-blue-950/40 backdrop-blur-xl md:p-7">
            <motion.div variants={sectionVariants} className="mb-5">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold text-blue-200">
                <Sparkles className="h-3 w-3" />
                Audit form
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight mb-1.5">
                Add your tools
              </h2>
              <p className="text-sm leading-5 text-slate-300">
                Enter your AI tools, costs, and governance details. Saves instantly to your browser.
              </p>
            </motion.div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <h3 className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-3">Org details</h3>
                <div className="grid gap-3 md:grid-cols-2">
                <FormField id="monthlySpend" label="Total monthly spend" hint="All-in spend across tools" error={errors.monthlySpend?.message}>
                  <input
                    id="monthlySpend"
                    type="number"
                    min={0}
                    step="0.01"
                    aria-invalid={Boolean(errors.monthlySpend)}
                    aria-describedby={errors.monthlySpend ? 'monthlySpend-error' : undefined}
                    {...register('monthlySpend', { valueAsNumber: true })}
                    className="block w-full rounded-xl border-slate-300 bg-white text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </FormField>

                <FormField id="seatCount" label="Seat count" hint="How many paid seats exist today?" error={errors.seatCount?.message}>
                  <input
                    id="seatCount"
                    type="number"
                    min={1}
                    step={1}
                    aria-invalid={Boolean(errors.seatCount)}
                    aria-describedby={errors.seatCount ? 'seatCount-error' : undefined}
                    {...register('seatCount', { valueAsNumber: true })}
                    className="block w-full rounded-xl border-slate-300 bg-white text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </FormField>

                <FormField id="teamSize" label="Team size" hint="Everyone who contributes to AI usage or approvals." error={errors.teamSize?.message}>
                  <input
                    id="teamSize"
                    type="number"
                    min={1}
                    step={1}
                    aria-invalid={Boolean(errors.teamSize)}
                    aria-describedby={errors.teamSize ? 'teamSize-error' : undefined}
                    {...register('teamSize', { valueAsNumber: true })}
                    className="block w-full rounded-xl border-slate-300 bg-white text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </FormField>

                <FormField id="primaryUseCase" label="Primary use case" hint="Pick the main reason you want to audit spend." error={errors.primaryUseCase?.message}>
                  <select
                    id="primaryUseCase"
                    aria-invalid={Boolean(errors.primaryUseCase)}
                    aria-describedby={errors.primaryUseCase ? 'primaryUseCase-error' : undefined}
                    {...register('primaryUseCase')}
                    className="block w-full rounded-xl border-slate-300 bg-white text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {primaryUseCaseOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormField>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-3">Plan & governance</h3>
                <div>
                  <PlanSelector
                    value={plan}
                    error={errors.plan?.message}
                    onChange={(value) => setValue('plan', value, { shouldDirty: true, shouldValidate: true })}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-3">Tools & spend</h3>
                <ToolRows control={control} errors={errors} fields={fields} append={append} remove={remove} update={update} />
              </div>

              <div className="flex flex-col gap-2.5 rounded-xl border border-white/10 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-sm p-3.5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-2">
                  <Database className="h-3.5 w-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-300">Auto-saving</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Data saves to your browser
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => resetDraft()}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20"
                  >
                    <RefreshCcw className="h-3 w-3" />
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/40 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
            {/* Current Spend - Main Widget */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/15 to-indigo-500/15 p-5 backdrop-blur-xl">
              <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">Current Spend</p>
              <p className="text-4xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                ${summary.totalSpend.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-400 mt-2">Across {fields.length} tool{fields.length !== 1 ? 's' : ''}</p>
            </div>

            {/* Estimated Savings */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Potential Savings</p>
                  <p className="text-2xl font-black text-emerald-400 mt-1">
                    ${estimatedSavings.toLocaleString()}
                  </p>
                </div>
                <span className="text-xs font-semibold text-emerald-300 px-2 py-1 rounded-lg bg-emerald-500/20">
                  {Math.round((estimatedSavings / summary.totalSpend) * 100)}%
                </span>
              </div>
              <p className="text-xs text-slate-400">With {plan} plan optimization</p>
            </div>

            {/* Tool Distribution */}
            {topTools.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/40 p-5">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3">Top Tools</p>
                <div className="space-y-2">
                  {topTools.map((tool, idx) => {
                    const percentage = Math.round((tool.spend / summary.totalSpend) * 100) || 0
                    return (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-slate-300 truncate font-medium">{tool.name}</p>
                          <p className="text-xs font-bold text-blue-300">${tool.spend.toLocaleString()}</p>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-700/50 overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Audit Completion */}
            {fields.length > 0 && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-amber-300 uppercase tracking-widest">Audit Progress</p>
                  <p className="text-sm font-black text-amber-400">{auditProgress}%</p>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-700/50 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                    style={{ width: `${auditProgress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">{fields.filter(f => f.provider && f.toolName && f.monthlySpend).length} of {fields.length} complete</p>
              </div>
            )}

            {/* Most Expensive Tool */}
            {mostExpensive && (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5">
                <p className="text-xs font-bold text-rose-300 uppercase tracking-widest mb-2">Most Expensive</p>
                <p className="text-xl font-black text-rose-400 mb-1">{mostExpensive.toolName || mostExpensive.provider}</p>
                <p className="text-xs text-slate-400">${Number(mostExpensive.monthlySpend).toLocaleString(undefined, { maximumFractionDigits: 2 })}/mo</p>
              </div>
            )}

            {/* Quick Summary Grid */}
            <div className="grid gap-2 grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Team Size</p>
                <p className="text-lg font-black text-white">{summary.totalSeats}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tools</p>
                <p className="text-lg font-black text-white">{fields.length}</p>
              </div>
            </div>

            {/* Last Saved */}
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 flex items-start gap-2">
              <Clock className="h-3.5 w-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-blue-300">Saved</p>
                <p className="text-slate-400">{updatedAt ? new Date(updatedAt).toLocaleString() : 'Not saved yet'}</p>
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-lg border border-slate-500/20 bg-slate-900/40 p-3">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">💡 Tips</p>
              <ul className="space-y-1 text-xs text-slate-400">
                <li>→ Complete all fields for better insights</li>
                <li>→ Higher team size = more savings</li>
                <li>→ Data auto-saves to your browser</li>
              </ul>
            </div>
          </aside>
        </motion.div>
      </div>
    </section>
  )
}
