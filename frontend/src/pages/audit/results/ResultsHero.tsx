import React from 'react'
import { BadgeCheck, CalendarDays, Clock3, TrendingUp } from 'lucide-react'
import type { AuditReport } from '../../../lib/audit-types'

type Props = {
  report: AuditReport
}

function formatMoney(amount: number): string {
  return amount.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export default function ResultsHero({ report }: Props) {
  const monthlySavings = report.totalEstimatedSavings
  const annualSavings = monthlySavings * 12
  const savingsRate = report.summary.currentSpend > 0 ? (monthlySavings / report.summary.currentSpend) * 100 : 0
  const topTool = report.summary.topExpensiveTool
  const generatedOn = new Date(report.timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] p-5 shadow-[0_24px_80px_rgba(2,6,23,0.5)] md:p-7 lg:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.14),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.08),_transparent_26%)]" />
      <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">
            <BadgeCheck className="h-3.5 w-3.5" />
            Deterministic audit complete
          </div>

          <div>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">Your spend audit, distilled into a decision surface</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
              Your stack was evaluated with transparent pricing logic and explicit rules. The results below are built for leadership reviews, screenshot sharing, and fast next-step decisions.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.35rem] border border-emerald-400/20 bg-[linear-gradient(180deg,rgba(16,185,129,0.18),rgba(15,23,42,0.72))] px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-200">Monthly savings</p>
              <p className="mt-2 text-2xl font-black text-emerald-300">${formatMoney(monthlySavings)}</p>
            </div>
            <div className="rounded-[1.35rem] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(6,182,212,0.18),rgba(15,23,42,0.72))] px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200">Annual savings</p>
              <p className="mt-2 text-2xl font-black text-cyan-300">${formatMoney(annualSavings)}</p>
            </div>
            <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Savings rate</p>
              <p className="mt-2 text-2xl font-black text-white">{savingsRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3 text-slate-300">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-blue-300" />
                <p className="text-xs font-bold uppercase tracking-[0.2em]">Current spend</p>
              </div>
              <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                {generatedOn}
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-white">${formatMoney(report.summary.currentSpend)}</p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <TrendingUp className="h-4 w-4 text-amber-300" />
              <p className="text-xs font-bold uppercase tracking-[0.2em]">Rules applied</p>
            </div>
            <p className="mt-2 text-2xl font-black text-white">{report.auditMetadata.rulesApplied}</p>
            <p className="text-xs text-slate-400">of {report.auditMetadata.rulesEvaluated} evaluated</p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock3 className="h-4 w-4 text-indigo-300" />
              <p className="text-xs font-bold uppercase tracking-[0.2em]">High confidence</p>
            </div>
            <p className="mt-2 text-2xl font-black text-white">{report.auditMetadata.highConfidenceRecommendations}</p>
            <p className="text-xs text-slate-400">recommendations</p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(56,189,248,0.12),rgba(15,23,42,0.68))] p-4 backdrop-blur-sm lg:col-span-1">
            <div className="flex items-center gap-2 text-slate-300">
              <BadgeCheck className="h-4 w-4 text-cyan-300" />
              <p className="text-xs font-bold uppercase tracking-[0.2em]">Top opportunity</p>
            </div>
            <p className="mt-2 text-xl font-black text-white">{topTool.name}</p>
            <p className="mt-1 text-sm text-slate-300">${formatMoney(topTool.spend)} monthly spend, or {topTool.percentage.toFixed(1)}% of the stack.</p>
          </div>
        </div>
      </div>
    </section>
  )
}