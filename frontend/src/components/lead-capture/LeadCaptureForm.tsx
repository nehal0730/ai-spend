import React, { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail, Sparkles } from 'lucide-react'
import { createLeadCaptureSchema, type LeadCaptureFormValues, type LeadCaptureMode, type LeadCaptureSource } from '../../lib/lead-capture-types'
import { getLeadCaptureEndpoint, requestConsultation, requestReportEmail, submitLeadCapture } from '../../lib/lead-capture-api'

type Props = {
  mode: LeadCaptureMode
  source: LeadCaptureSource
  title: string
  description: string
  submitLabel?: string
  shareId?: string
  reportTitle?: string
  reportUrl?: string
  compact?: boolean
  className?: string
  onSuccess?: (message: string) => void
  onCancel?: () => void
}

function getDefaultValues(props: Props): LeadCaptureFormValues {
  return {
    email: '',
    company: '',
    role: '',
    teamSize: undefined,
    message: '',
    source: props.source,
    shareId: props.shareId || '',
    reportTitle: props.reportTitle || '',
    reportUrl: props.reportUrl || '',
    honeypot: '',
    startedAt: new Date().toISOString()
  }
}

function getButtonCopy(mode: LeadCaptureMode): string {
  switch (mode) {
    case 'report':
      return 'Email my report'
    case 'contact':
      return 'Request follow-up'
    default:
      return 'Send updates'
  }
}

export default function LeadCaptureForm(props: Props) {
  const schema = useMemo(() => createLeadCaptureSchema(props.mode), [props.mode])
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const form = useForm<LeadCaptureFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: getDefaultValues(props),
    mode: 'onChange'
  })

  useEffect(() => {
    form.reset(getDefaultValues(props))
  }, [form, props.mode, props.reportTitle, props.reportUrl, props.shareId, props.source])

  const { register, handleSubmit, formState, reset } = form
  const { errors, isSubmitting } = formState

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage(null)
    setSuccessMessage(null)

    const payload = {
      ...values,
      email: values.email.trim().toLowerCase(),
      source: props.source,
      shareId: props.shareId || values.shareId || undefined,
      reportTitle: props.reportTitle || values.reportTitle || undefined,
      reportUrl: props.reportUrl || values.reportUrl || undefined,
      startedAt: values.startedAt || new Date().toISOString(),
      honeypot: values.honeypot || ''
    }

    const endpoint = getLeadCaptureEndpoint(props.mode)
    const response =
      endpoint === '/api/leads'
        ? await submitLeadCapture(payload)
        : endpoint === '/api/reports/email'
          ? await requestReportEmail(payload)
          : await requestConsultation(payload)

    if (!response.success) {
      setErrorMessage(response.error)
      return
    }

    setSuccessMessage(response.data.message)
    props.onSuccess?.(response.data.message)
    reset(getDefaultValues(props))
  })

  const compactGrid = props.compact ? 'grid gap-3 md:grid-cols-2' : 'grid gap-3 sm:grid-cols-2'

  return (
    <div className={`rounded-[1.8rem] border border-white/10 bg-white/70 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-xl dark:bg-slate-950/55 dark:shadow-[0_18px_50px_rgba(2,6,23,0.32)] ${props.className || ''}`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            Lead capture
          </div>
          <h3 className="mt-3 text-xl font-black tracking-tight text-primary dark:text-white">{props.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted dark:text-slate-300">{props.description}</p>
        </div>
        {props.onCancel ? (
          <button type="button" onClick={props.onCancel} className="rounded-full border border-surface bg-white px-3 py-1.5 text-xs font-semibold text-soft transition-colors hover:bg-slate-50 dark:bg-slate-900/80 dark:text-slate-300">
            Close
          </button>
        ) : null}
      </div>

      {successMessage ? (
        <div className="rounded-[1.2rem] border border-emerald-400/20 bg-emerald-400/10 p-4 text-emerald-950 dark:text-emerald-50">
          <p className="text-sm font-semibold">Thanks. Your request was received.</p>
          <p className="mt-1 text-sm leading-6 text-emerald-900/80 dark:text-emerald-100/90">{successMessage}</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <input type="hidden" {...register('source')} value={props.source} />
          <input type="hidden" {...register('shareId')} value={props.shareId || ''} />
          <input type="hidden" {...register('reportTitle')} value={props.reportTitle || ''} />
          <input type="hidden" {...register('reportUrl')} value={props.reportUrl || ''} />
          <input type="hidden" {...register('startedAt')} />
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="companyWebsite">Website</label>
            <input id="companyWebsite" type="text" tabIndex={-1} autoComplete="off" {...register('honeypot')} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-soft">Email</span>
              <input
                type="email"
                aria-invalid={Boolean(errors.email)}
                className="block w-full rounded-xl border-surface bg-white text-primary shadow-[0_10px_24px_rgba(15,23,42,0.06)] focus:border-cyan-400 focus:ring-cyan-400 dark:bg-slate-950/80 dark:text-white"
                placeholder="you@company.com"
                {...register('email')}
              />
              {errors.email?.message ? <span className="text-xs text-rose-600 dark:text-rose-300">{errors.email.message}</span> : null}
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-soft">Company</span>
              <input
                type="text"
                aria-invalid={Boolean(errors.company)}
                className="block w-full rounded-xl border-surface bg-white text-primary shadow-[0_10px_24px_rgba(15,23,42,0.06)] focus:border-cyan-400 focus:ring-cyan-400 dark:bg-slate-950/80 dark:text-white"
                placeholder="Acme Inc."
                {...register('company')}
              />
              {errors.company?.message ? <span className="text-xs text-rose-600 dark:text-rose-300">{errors.company.message}</span> : null}
            </label>
          </div>

          <div className={compactGrid}>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-soft">Role</span>
              <input
                type="text"
                aria-invalid={Boolean(errors.role)}
                className="block w-full rounded-xl border-surface bg-white text-primary shadow-[0_10px_24px_rgba(15,23,42,0.06)] focus:border-cyan-400 focus:ring-cyan-400 dark:bg-slate-950/80 dark:text-white"
                placeholder="Finance, IT, Ops"
                {...register('role')}
              />
              {errors.role?.message ? <span className="text-xs text-rose-600 dark:text-rose-300">{errors.role.message}</span> : null}
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-soft">Team size</span>
              <input
                type="number"
                min={1}
                step={1}
                aria-invalid={Boolean(errors.teamSize)}
                className="block w-full rounded-xl border-surface bg-white text-primary shadow-[0_10px_24px_rgba(15,23,42,0.06)] focus:border-cyan-400 focus:ring-cyan-400 dark:bg-slate-950/80 dark:text-white"
                placeholder="12"
                {...register('teamSize', { valueAsNumber: true })}
              />
              {errors.teamSize?.message ? <span className="text-xs text-rose-600 dark:text-rose-300">{errors.teamSize.message}</span> : null}
            </label>
          </div>

          {props.mode !== 'lead' ? (
            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-soft">Message</span>
              <textarea
                rows={props.compact ? 3 : 4}
                aria-invalid={Boolean(errors.message)}
                className="block w-full rounded-[1.1rem] border-surface bg-white text-primary shadow-[0_10px_24px_rgba(15,23,42,0.06)] focus:border-cyan-400 focus:ring-cyan-400 dark:bg-slate-950/80 dark:text-white"
                placeholder={props.mode === 'contact' ? 'Tell us what you want help with.' : 'Add context for the report delivery.'}
                {...register('message')}
              />
              {errors.message?.message ? <span className="text-xs text-rose-600 dark:text-rose-300">{errors.message.message}</span> : null}
            </label>
          ) : null}

          {errorMessage ? <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-800 dark:text-rose-100">{errorMessage}</div> : null}

          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-soft dark:text-slate-400">
              <Mail className="mr-1 inline-block h-3.5 w-3.5 align-[-2px] text-cyan-600 dark:text-cyan-300" />
              We only use your email to send the requested audit, report, or follow-up. No noise.
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {props.submitLabel || getButtonCopy(props.mode)}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
