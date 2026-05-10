import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'

export default function ResultsEmptyState() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.14),_transparent_26%),linear-gradient(180deg,_rgba(2,6,23,1),_rgba(15,23,42,0.98))]" />
      <div className="container relative z-10 mx-auto flex min-h-screen max-w-4xl items-center px-4 py-16 md:px-6 lg:px-8">
        <section className="w-full rounded-[2.5rem] border border-white/10 bg-white/5 p-6 text-center shadow-2xl shadow-slate-950/30 backdrop-blur-xl md:p-10">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-cyan-100">
            <Sparkles className="h-3.5 w-3.5" />
            No saved results yet
          </div>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-white md:text-4xl">Run the audit to generate this page</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
            Results are stored after a successful audit run. Go back to the input page, run the engine, and this page will become your shareable audit report.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.35rem] border border-white/10 bg-slate-950/60 px-4 py-4 text-left">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">What you will get</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">A clear executive summary, per-tool breakdown, and explainable recommendations.</p>
            </div>
            <div className="rounded-[1.35rem] border border-white/10 bg-slate-950/60 px-4 py-4 text-left">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Built for sharing</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">The layout is optimized for screenshots, leadership review, and follow-up.</p>
            </div>
          </div>
          <Link
            to="/audit"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to input form
          </Link>
        </section>
      </div>
    </main>
  )
}