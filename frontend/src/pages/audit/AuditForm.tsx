import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Database, Clock, RefreshCcw, Sparkles } from 'lucide-react'
import FormField from './FormField'
import PlanSelector from './PlanSelector'
import ToolRows from './ToolRows'
import {
  aiSpendFormSchema,
  defaultAISpendFormValues,
  primaryUseCaseOptions,
  type AISpendFormValues
} from '../../lib/spend-form'
import { useSpendFormStore } from '../../lib/spend-form/store'
import { useAuditResultsStore } from '../../lib/audit-results-store'
import { runRemoteAudit } from '../../lib/audit-api'

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, staggerChildren: 0.08 }
  }
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

export default function AuditForm() {
  const navigate = useNavigate()
  const draft = useSpendFormStore((state) => state.draft)
  const updatedAt = useSpendFormStore((state) => state.updatedAt)
  const setDraft = useSpendFormStore((state) => state.setDraft)
  const resetDraft = useSpendFormStore((state) => state.resetDraft)
  const setLatestResult = useAuditResultsStore((state) => state.setLatestResult)
  const clearLatestReport = useAuditResultsStore((state) => state.clearLatestReport)
  const [auditError, setAuditError] = useState<string | null>(null)
  const [isRunningAudit, setIsRunningAudit] = useState(false)

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
  const mostExpensive = useMemo(() => getMostExpensiveTool(tools), [tools])
  const auditProgress = useMemo(() => getAuditProgress(tools), [tools])
  const topTools = useMemo(() => getTopTools(tools, 3), [tools])

  const onSubmit = (values: AISpendFormValues) => {
    setDraft(values)
  }

  const handleRunAudit = handleSubmit(async (values) => {
    setIsRunningAudit(true)
    setAuditError(null)

    try {
      setDraft(values)
      const result = await runRemoteAudit(values)

      if (result.success) {
        setLatestResult(result.data.report, result.data.share)
        navigate('/audit/results')
        return
      }

      clearLatestReport()
      setAuditError(result.error ?? 'Unable to run audit right now.')
    } finally {
      setIsRunningAudit(false)
    }
  }, () => {
    setAuditError('Please fix the highlighted fields before running the audit.')
  })

  return (
    <section id="spend-input-form" className="relative overflow-hidden py-12 text-primary md:py-16 lg:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(6,182,212,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.10),_transparent_24%),linear-gradient(180deg,_rgba(248,250,252,1),_rgba(241,245,249,0.98))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.24),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.18),_transparent_24%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(2,6,23,1))]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent dark:via-blue-400/70" />

      <div className="container px-4 md:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Main Form Card */}
          <div className="rounded-[2.5rem] bg-surface p-8 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl md:p-10 lg:p-12 dark:shadow-[0_24px_70px_rgba(2,6,23,0.45)]">
            <motion.div variants={sectionVariants} className="mb-8">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-200">
                <Sparkles className="h-3 w-3" />
                Audit form
              </div>
              <h2 className="mb-1.5 text-2xl font-black leading-tight tracking-tight text-primary dark:text-white md:text-3xl">
                Add your tools
              </h2>
              <p className="text-sm leading-5 text-muted dark:text-slate-300">
                Enter your AI tools, costs, and governance details. Saves instantly to your browser.
              </p>
            </motion.div>

            {/* Key Metrics Grid */}
            <div className="mb-10 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:bg-blue-500/10 dark:shadow-[0_12px_34px_rgba(2,6,23,0.25)]">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-cyan-700 dark:text-blue-300">Current Spend</p>
                <p className="bg-gradient-to-r from-cyan-500 to-indigo-500 bg-clip-text text-2xl font-black text-transparent md:text-3xl">
                  ${summary.totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="mt-2 text-xs text-soft dark:text-slate-400">{fields.length} tool{fields.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="rounded-xl bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:bg-emerald-500/10 dark:shadow-[0_12px_34px_rgba(2,6,23,0.25)]">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Est. Savings (preview)</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 md:text-3xl">
                  ${Math.round(summary.totalSpend * 0.25).toLocaleString()}
                </p>
                <p className="mt-2 text-xs text-soft dark:text-slate-400">25% estimate â€¢ See results page for actual</p>
              </div>
              <div className="rounded-xl bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:bg-cyan-500/10 dark:shadow-[0_12px_34px_rgba(2,6,23,0.25)]">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-300">Form Readiness</p>
                <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400 md:text-3xl">{auditProgress}%</p>
                <p className="mt-2 text-xs text-soft dark:text-slate-400">{fields.filter(f => f.provider && f.toolName && f.monthlySpend).length}/{fields.length} complete</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-cyan-700 dark:text-blue-300">Org details</h3>
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
                      className="block w-full rounded-xl bg-white text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.06)] focus:ring-2 focus:ring-cyan-500/50 dark:bg-slate-900 dark:text-white dark:shadow-[0_10px_24px_rgba(2,6,23,0.25)]"
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
                      className="block w-full rounded-xl bg-white text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.06)] focus:ring-2 focus:ring-cyan-500/50 dark:bg-slate-900 dark:text-white dark:shadow-[0_10px_24px_rgba(2,6,23,0.25)]"
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
                      className="block w-full rounded-xl bg-white text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.06)] focus:ring-2 focus:ring-cyan-500/50 dark:bg-slate-900 dark:text-white dark:shadow-[0_10px_24px_rgba(2,6,23,0.25)]"
                    />
                  </FormField>

                  <FormField id="primaryUseCase" label="Primary use case" hint="Pick the main reason you want to audit spend." error={errors.primaryUseCase?.message}>
                    <select
                      id="primaryUseCase"
                      aria-invalid={Boolean(errors.primaryUseCase)}
                      aria-describedby={errors.primaryUseCase ? 'primaryUseCase-error' : undefined}
                      {...register('primaryUseCase')}
                      className="block w-full rounded-xl bg-white text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.06)] focus:ring-2 focus:ring-cyan-500/50 dark:bg-slate-900 dark:text-white dark:shadow-[0_10px_24px_rgba(2,6,23,0.25)]"
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
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-cyan-700 dark:text-blue-300">Plan & governance</h3>
                <div>
                  <PlanSelector
                    value={plan}
                    error={errors.plan?.message}
                    onChange={(value) => setValue('plan', value, { shouldDirty: true, shouldValidate: true })}
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-cyan-700 dark:text-blue-300">Tools & spend</h3>
                <ToolRows control={control} errors={errors} fields={fields} append={append} remove={remove} update={update} />
              </div>

              <div className="flex flex-col gap-3 rounded-2xl bg-gradient-to-r from-cyan-50 to-indigo-50 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm md:flex-row md:items-center md:justify-between dark:from-blue-500/10 dark:to-indigo-500/10 dark:shadow-[0_14px_40px_rgba(2,6,23,0.25)]">
                <div className="flex items-start gap-2">
                  <Database className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-cyan-600 dark:text-blue-400" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-cyan-700 dark:text-blue-300">Auto-saving</p>
                    <p className="mt-0.5 text-xs text-soft dark:text-slate-400">
                      Data saves to your browser {updatedAt && `â€¢ Last saved ${new Date(updatedAt).toLocaleTimeString()}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 flex-shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      form.reset(defaultAISpendFormValues)
                      resetDraft()
                      setAuditError(null)
                      clearLatestReport()
                    }}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-primary shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-all hover:bg-slate-50 dark:bg-slate-950/60 dark:text-white dark:shadow-[0_10px_24px_rgba(2,6,23,0.25)] dark:hover:bg-white/10"
                  >
                    <RefreshCcw className="h-3 w-3" />
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void handleRunAudit()
                    }}
                    disabled={isRunningAudit}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-4 py-2.5 text-xs font-bold text-cyan-700 shadow-lg shadow-cyan-500/10 transition-all hover:-translate-y-0.5 hover:bg-cyan-400/15 hover:border-cyan-300/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:text-cyan-100"
                  >
                    <Sparkles className="h-3 w-3" />
                    {isRunningAudit ? 'Running...' : 'Run audit'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Save draft
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Top Tools Section */}
          {topTools.length > 0 && (
            <div className="rounded-[2.5rem] bg-surface p-8 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl md:p-10 dark:shadow-[0_24px_70px_rgba(2,6,23,0.45)]">
              <h3 className="mb-8 text-lg font-bold text-primary dark:text-white md:text-xl">Top AI tools by spend</h3>
              <div className="space-y-4">
                {topTools.map((tool, idx) => {
                  const percentage = Math.round((tool.spend / summary.totalSpend) * 100) || 0
                  return (
                    <div key={idx} className="rounded-xl border border-surface bg-white p-5 transition-colors hover:bg-slate-50 dark:bg-slate-950/60 dark:hover:bg-slate-950/70">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-primary dark:text-white">{tool.name}</p>
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">${tool.spend.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</p>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-500"
                          style={{ width: `${Math.max(5, percentage)}%` }}
                        />
                      </div>
                      <p className="mt-2.5 text-xs text-soft dark:text-slate-400">{percentage}% of total spend</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Error State */}
          <AnimatePresence mode="wait">
            {auditError ? (
              <motion.div
                key="audit-error"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                className="rounded-[2rem] border border-rose-400/20 bg-rose-50 p-6 text-rose-900 shadow-2xl shadow-rose-950/10 dark:bg-rose-400/10 dark:text-rose-100 dark:shadow-rose-950/20"
              >
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-rose-700 dark:text-rose-200">Audit could not run</p>
                <p className="text-sm leading-6 text-rose-800 dark:text-rose-100/90">{auditError}</p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-[2.5rem] bg-surface p-8 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl md:p-10 dark:shadow-[0_24px_70px_rgba(2,6,23,0.45)]"
          >
            <div className="flex flex-col gap-6">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-300">How it works</p>
                <h3 className="text-xl font-black tracking-tight text-primary dark:text-white md:text-2xl">Results open on their own page</h3>
                <p className="mt-3 text-sm leading-6 text-muted dark:text-slate-300">
                  Click "Run audit" to send your data to our backend rule engine. Results appear on a dedicated page with detailed recommendations, savings breakdowns, and implementation guidance.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-50 p-4 dark:border-blue-500/30 dark:bg-blue-500/10">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-cyan-700 dark:text-blue-300">Deterministic</p>
                  <p className="text-sm font-semibold text-primary dark:text-white">Rule engine</p>
                </div>
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Financial</p>
                  <p className="text-sm font-semibold text-primary dark:text-white">Calculations</p>
                </div>
                <div className="rounded-xl border border-indigo-500/20 bg-indigo-50 p-4 dark:border-indigo-500/30 dark:bg-indigo-500/10">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">Actionable</p>
                  <p className="text-sm font-semibold text-primary dark:text-white">Recommendations</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
