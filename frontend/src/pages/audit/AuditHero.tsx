import React from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, ArrowLeft, BarChart3, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AuditHero() {
  return (
    <section className="relative overflow-hidden border-b border-surface bg-gradient-to-b from-white via-slate-50 to-slate-100 text-primary dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-white">
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl dark:bg-blue-500/10" />
      <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent dark:via-blue-500/30" />

      <div className="container px-4 md:px-6 lg:px-8 py-8 md:py-10 lg:py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-cyan-700 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-200">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Spend Audit</span>
            </div>

            <h1 className="mb-3 text-4xl font-black tracking-tight leading-tight md:text-5xl lg:text-6xl">
              Capture your AI spend in one place.
            </h1>

            <p className="max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
              Enter your current stack, save your data locally, and run a deterministic audit that opens results on a separate page.
            </p>
          </div>

          <div className="grid gap-3 md:gap-4 md:grid-cols-3 max-w-2xl">
            <div className="rounded-lg bg-white/80 p-3 shadow-[0_12px_30px_rgba(15,23,42,0.06)] dark:bg-blue-500/10 dark:shadow-[0_12px_30px_rgba(2,6,23,0.25)] md:p-4">
              <p className="mb-1 text-xs font-semibold uppercase text-cyan-700 dark:text-blue-200">Fast</p>
              <p className="text-sm text-muted">Complete your audit in minutes</p>
            </div>
            <div className="rounded-lg bg-white/80 p-3 shadow-[0_12px_30px_rgba(15,23,42,0.06)] dark:bg-blue-500/10 dark:shadow-[0_12px_30px_rgba(2,6,23,0.25)] md:p-4">
              <p className="mb-1 text-xs font-semibold uppercase text-cyan-700 dark:text-blue-200">Saved</p>
              <p className="text-sm text-muted">Data persists locally in browser</p>
            </div>
            <div className="rounded-lg bg-white/80 p-3 shadow-[0_12px_30px_rgba(15,23,42,0.06)] dark:bg-blue-500/10 dark:shadow-[0_12px_30px_rgba(2,6,23,0.25)] md:p-4">
              <p className="mb-1 text-xs font-semibold uppercase text-cyan-700 dark:text-blue-200">Private</p>
              <p className="text-sm text-muted">Calculations run on the backend engine</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-surface px-6 py-3 text-sm font-semibold text-primary shadow-[0_14px_36px_rgba(15,23,42,0.08)] transition-all hover:bg-slate-100 dark:bg-slate-900/70 dark:text-white dark:shadow-[0_14px_36px_rgba(2,6,23,0.35)] dark:hover:bg-slate-800/60"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to landing
            </Link>
            <a
              href="#spend-input-form"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/30"
            >
              <Zap className="h-4 w-4" />
              Start audit
              <ArrowDown className="h-4 w-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}