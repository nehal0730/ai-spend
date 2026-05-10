import React from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, ArrowLeft, BarChart3, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AuditHero() {
  return (
    <section className="relative border-b border-white/10 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-white overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

      <div className="container px-4 md:px-6 lg:px-8 py-8 md:py-10 lg:py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-400/30 bg-blue-400/10 mb-4">
              <BarChart3 className="h-4 w-4 text-blue-300" />
              <span className="text-xs font-bold uppercase tracking-widest text-blue-300">Spend Audit</span>
            </div>

            <h1 className="text-4xl font-black tracking-tight md:text-5xl lg:text-6xl leading-tight mb-3">
              Capture your AI spend in one place.
            </h1>

            <p className="text-lg text-slate-300 md:text-xl leading-relaxed max-w-2xl">
              Enter your current stack, save your data locally, and run a deterministic audit that opens results on a separate page.
            </p>
          </div>

          <div className="grid gap-3 md:gap-4 md:grid-cols-3 max-w-2xl">
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 md:p-4">
              <p className="text-xs font-semibold text-blue-300 uppercase mb-1">Fast</p>
              <p className="text-sm text-slate-300">Complete your audit in minutes</p>
            </div>
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 md:p-4">
              <p className="text-xs font-semibold text-blue-300 uppercase mb-1">Saved</p>
              <p className="text-sm text-slate-300">Data persists locally in browser</p>
            </div>
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 md:p-4">
              <p className="text-xs font-semibold text-blue-300 uppercase mb-1">Private</p>
              <p className="text-sm text-slate-300">Calculations run on the backend engine</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to landing
            </Link>
            <a
              href="#spend-input-form"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5"
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