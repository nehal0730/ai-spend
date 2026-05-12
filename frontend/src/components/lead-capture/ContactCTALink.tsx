import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'

export default function ContactCTALink() {
  return (
    <section className="relative overflow-hidden rounded-[2.2rem] border border-surface bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(241,245,249,0.96))] p-8 md:p-12 shadow-[0_20px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,0.98))]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(6,182,212,0.12),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(99,102,231,0.10),_transparent_28%)]" />
      
      <div className="relative max-w-2xl">
        <div className="mb-4 flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            Need a follow-up?
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-soft dark:text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            No spam, no sales pressure
          </div>
        </div>

        <h3 className="text-2xl font-black tracking-tight text-primary dark:text-white">
          Want a practical follow-up after the audit?
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted dark:text-slate-300">
          Leave your email and a short note. We will send a focused follow-up with next steps, recommendations, and implementation help.
        </p>

        <Link
          to="/contact"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-gradient-to-r from-cyan-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(6,182,212,0.25)] transition-all hover:shadow-[0_15px_35px_rgba(6,182,212,0.35)] dark:shadow-[0_10px_24px_rgba(6,182,212,0.15)]"
        >
          <span>Start the conversation</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
