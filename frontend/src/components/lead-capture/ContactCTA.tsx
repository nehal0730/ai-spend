import React from 'react'
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import LeadCaptureForm from './LeadCaptureForm'
import type { LeadCaptureSource } from '../../lib/lead-capture-types'

type Props = {
  source: LeadCaptureSource
  title: string
  description: string
  submitLabel?: string
  className?: string
}

export default function ContactCTA({ source, title, description, submitLabel, className = '' }: Props) {
  return (
    <section className={`relative overflow-hidden rounded-[2.2rem] border border-surface bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(241,245,249,0.96))] p-4 shadow-[0_20px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,0.98))] ${className}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(6,182,212,0.12),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(99,102,241,0.10),_transparent_28%)]" />
      <div className="relative mb-4 flex items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200">
          <Sparkles className="h-3.5 w-3.5" />
          Need a follow-up?
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-soft dark:text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          No spam, no sales pressure
        </div>
      </div>

      <div className="relative grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-primary dark:text-white">{title}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted dark:text-slate-300">{description}</p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-surface bg-white px-4 py-2 text-sm font-semibold text-primary shadow-[0_10px_24px_rgba(15,23,42,0.06)] dark:bg-slate-950/60 dark:text-slate-100">
            <ArrowRight className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
            Get the next step without leaving the page
          </div>
        </div>

        <LeadCaptureForm
          mode="contact"
          source={source}
          title="Start the conversation"
          description="Share your email and a short note. We will send a follow-up with practical next steps."
          submitLabel={submitLabel || 'Request consultation'}
          compact
          className="h-full"
        />
      </div>
    </section>
  )
}
