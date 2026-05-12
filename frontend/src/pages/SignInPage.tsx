import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-slate-200/70 bg-white/90 p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/85 md:p-12">
          <div className="mb-6 flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" />
              Sign in
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-soft dark:text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Access your audit results and saved reports
            </div>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-primary dark:text-white md:text-4xl">
            Sign in to continue
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted dark:text-slate-300 md:text-base">
            There is no full account system yet, so this page acts as the entry point for saved reports and support requests.
          </p>

          <div className="mt-8 space-y-4">
            <Link
              to="/audit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white transition-all hover:from-cyan-600 hover:to-indigo-600"
            >
              Go to audit
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Contact support
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}