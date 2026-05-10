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
  const setLatestReport = useAuditResultsStore((state) => state.setLatestReport)
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
        setLatestReport(result.report)
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
    <section id="spend-input-form" className="py-12 md:py-16 lg:py-20 bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.24),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.18),_transparent_24%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(2,6,23,1))]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />

      <div className="container px-4 md:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Main Form Card */}
          <div className="rounded-[2.5rem] border border-white/10 bg-white/6 p-8 shadow-2xl shadow-blue-950/40 backdrop-blur-xl md:p-10 lg:p-12">
            <motion.div variants={sectionVariants} className="mb-8">
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

            {/* Key Metrics Grid */}
            <div className="mb-10 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-5 backdrop-blur-sm">
                <p className="text-[11px] font-bold text-blue-300 uppercase tracking-wider mb-2">Current Spend</p>
                <p className="text-2xl md:text-3xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  ${summary.totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-slate-400 mt-2">{fields.length} tool{fields.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5 backdrop-blur-sm">
                <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-2">Est. Savings (preview)</p>
                <p className="text-2xl md:text-3xl font-black text-emerald-400">
                  ${Math.round(summary.totalSpend * 0.25).toLocaleString()}
                </p>
                <p className="text-xs text-slate-400 mt-2">25% estimate â€¢ See results page for actual</p>
              </div>
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-5 backdrop-blur-sm">
                <p className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider mb-2">Form Readiness</p>
                <p className="text-2xl md:text-3xl font-black text-cyan-400">{auditProgress}%</p>
                <p className="text-xs text-slate-400 mt-2">{fields.filter(f => f.provider && f.toolName && f.monthlySpend).length}/{fields.length} complete</p>
              </div>
            </div>

            {/* Form */}
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
                      className="block w-full rounded-xl border border-slate-300 bg-white text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
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
                      className="block w-full rounded-xl border border-slate-300 bg-white text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
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
                      className="block w-full rounded-xl border border-slate-300 bg-white text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                    />
                  </FormField>

                  <FormField id="primaryUseCase" label="Primary use case" hint="Pick the main reason you want to audit spend." error={errors.primaryUseCase?.message}>
                    <select
                      id="primaryUseCase"
                      aria-invalid={Boolean(errors.primaryUseCase)}
                      aria-describedby={errors.primaryUseCase ? 'primaryUseCase-error' : undefined}
                      {...register('primaryUseCase')}
                      className="block w-full rounded-xl border border-slate-300 bg-white text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
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

              <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-sm p-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-2">
                  <Database className="h-3.5 w-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-300">Auto-saving</p>
                    <p className="text-xs text-slate-400 mt-0.5">
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
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20"
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
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-4 py-2.5 text-xs font-bold text-cyan-100 shadow-lg shadow-cyan-500/10 transition-all hover:-translate-y-0.5 hover:bg-cyan-400/15 hover:border-cyan-300/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    <Sparkles className="h-3 w-3" />
                    {isRunningAudit ? 'Running...' : 'Run audit'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/40 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
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
            <div className="rounded-[2.5rem] border border-white/10 bg-white/6 p-8 shadow-2xl shadow-blue-950/40 backdrop-blur-xl md:p-10">
              <h3 className="text-lg md:text-xl font-bold text-white mb-8">Top AI tools by spend</h3>
              <div className="space-y-4">
                {topTools.map((tool, idx) => {
                  const percentage = Math.round((tool.spend / summary.totalSpend) * 100) || 0
                  return (
                    <div key={idx} className="p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-white">{tool.name}</p>
                        <p className="text-sm font-bold text-emerald-400">${tool.spend.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</p>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-500"
                          style={{ width: `${Math.max(5, percentage)}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-2.5">{percentage}% of total spend</p>
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
                className="rounded-[2rem] border border-rose-400/20 bg-rose-400/10 p-6 text-rose-100 shadow-2xl shadow-rose-950/20"
              >
                <p className="text-xs font-bold uppercase tracking-widest text-rose-200 mb-2">Audit could not run</p>
                <p className="text-sm leading-6 text-rose-100/90">{auditError}</p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-[2.5rem] border border-white/10 bg-white/6 p-8 shadow-2xl shadow-blue-950/40 backdrop-blur-xl md:p-10"
          >
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-300 mb-2">How it works</p>
                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white">Results open on their own page</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Click "Run audit" to send your data to our backend rule engine. Results appear on a dedicated page with detailed recommendations, savings breakdowns, and implementation guidance.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-blue-300 mb-1">Deterministic</p>
                  <p className="text-sm font-semibold text-white">Rule engine</p>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 mb-1">Financial</p>
                  <p className="text-sm font-semibold text-white">Calculations</p>
                </div>
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 mb-1">Actionable</p>
                  <p className="text-sm font-semibold text-white">Recommendations</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
