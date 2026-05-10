import React from 'react'
import { ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react'
import type { AuditReport } from '../../../lib/audit-types'

type Props = {
  report: AuditReport
}

function formatMoney(amount: number): string {
  return amount.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export default function ResultsCTA({ report }: Props) {
  const monthlySavings = report.totalEstimatedSavings
  const annualSavings = monthlySavings * 12
  const savingsRate = report.summary.currentSpend > 0 ? (monthlySavings / report.summary.currentSpend) * 100 : 0
  const shouldEscalate = annualSavings >= 10000 || savingsRate >= 20
  const isLowSavings = annualSavings < 3000 || report.recommendations.length === 0

  if (shouldEscalate) {
    return (
      <section className="relative overflow-hidden rounded-[1.9rem] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(6,182,212,0.18),rgba(15,23,42,0.92))] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(103,232,249,0.18),_transparent_30%)]" />
        <div className="relative inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-cyan-100">
          <CheckCircle2 className="h-3.5 w-3.5" />
          High savings detected
        </div>
        <h2 className="relative mt-4 text-2xl font-black tracking-tight text-white">Credex can help capture this faster</h2>
        <p className="relative mt-3 text-sm leading-6 text-slate-300">
          Your audit shows ${formatMoney(monthlySavings)} per month, or about ${formatMoney(annualSavings)} per year, in potential savings. That is enough to justify a direct consultation and a focused rollout plan.
        </p>

        <div className="relative mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.25rem] border border-cyan-400/15 bg-white/5 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">Monthly</p>
            <p className="mt-1 text-xl font-black text-white">${formatMoney(monthlySavings)}</p>
          </div>
          <div className="rounded-[1.25rem] border border-cyan-400/15 bg-white/5 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">Annual</p>
            <p className="mt-1 text-xl font-black text-white">${formatMoney(annualSavings)}</p>
          </div>
          <div className="rounded-[1.25rem] border border-cyan-400/15 bg-white/5 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">Savings rate</p>
            <p className="mt-1 text-xl font-black text-white">{savingsRate.toFixed(1)}%</p>
          </div>
        </div>

        <div className="relative mt-5 grid gap-3 sm:grid-cols-2">
          <a
            href="mailto:consulting@credex.ai?subject=Credex%20AI%20Spend%20Consultation"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Book Credex consultation
            <ArrowRight className="h-4 w-4" />
          </a>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
            Recommended when annual savings exceed $10k or the audit rate is above 20%.
          </div>
        </div>
      </section>
    )
  }

  if (isLowSavings) {
    return (
      <section className="relative overflow-hidden rounded-[1.9rem] border border-emerald-400/20 bg-[linear-gradient(180deg,rgba(16,185,129,0.14),rgba(15,23,42,0.92))] p-5 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(110,231,183,0.16),_transparent_30%)]" />
        <div className="relative inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">
          <ShieldAlert className="h-3.5 w-3.5" />
          Low savings, honest signal
        </div>
        <h2 className="relative mt-4 text-2xl font-black tracking-tight text-white">Your stack is already fairly efficient</h2>
        <p className="relative mt-3 text-sm leading-6 text-slate-300">
          The audit only found about ${formatMoney(monthlySavings)} per month in near-term savings. That is a good sign. The next meaningful gains are more likely to come from governance, seat discipline, or future growth, not immediate cost cutting.
        </p>
        <div className="relative mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          Best next move: keep this page bookmarked and rerun the audit when seat count, vendor mix, or usage changes.
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden rounded-[1.9rem] border border-amber-400/20 bg-[linear-gradient(180deg,rgba(251,191,36,0.14),rgba(15,23,42,0.92))] p-5 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(252,211,77,0.14),_transparent_30%)]" />
      <div className="relative inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-amber-100">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Worth a closer look
      </div>
      <h2 className="relative mt-4 text-2xl font-black tracking-tight text-white">Meaningful savings, but not a full overhaul</h2>
      <p className="relative mt-3 text-sm leading-6 text-slate-300">
        This audit points to ${formatMoney(monthlySavings)} per month in savings. That is enough to justify targeted action, but the stack may not need a broad restructuring.
      </p>
      <div className="relative mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
        Focus on the top one or two recommendations first to keep the rollout low risk.
      </div>
    </section>
  )
}