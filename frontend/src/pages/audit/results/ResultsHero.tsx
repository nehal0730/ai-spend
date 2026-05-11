import React, { useMemo } from 'react'
import { BadgeCheck, CalendarDays, TrendingUp } from 'lucide-react'
import Stat from '../../../components/ui/Stat'
import Card from '../../../components/ui/Card'
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
  const providerBreakdown = useMemo(() => {
    const totals = report.input.tools.reduce<Record<string, number>>((acc, tool) => {
      acc[tool.provider] = (acc[tool.provider] ?? 0) + tool.monthlySpend
      return acc
    }, {})

    return Object.entries(totals)
      .map(([provider, spend]) => ({
        provider,
        spend,
        share: report.summary.currentSpend > 0 ? (spend / report.summary.currentSpend) * 100 : 0
      }))
      .sort((left, right) => right.spend - left.spend)
      .slice(0, 4)
  }, [report.input.tools, report.summary.currentSpend])

  const generatedOn = new Date(report.timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] p-5 shadow-[0_24px_80px_rgba(2,6,23,0.5)] md:p-7 lg:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.12),_transparent_26%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.08),_transparent_24%)]" />
      <div className="relative grid gap-6 lg:grid-cols-[1.28fr_0.92fr] lg:items-start">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">
            <BadgeCheck className="h-3.5 w-3.5" />
            Deterministic audit complete
          </div>

          <div className="space-y-2">
            <h1 className="max-w-full">
              <span className="block whitespace-nowrap text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">Your spend audit,</span>
              <span className="block mt-1 text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">distilled into a decision surface</span>
            </h1>
            {/* <p className="max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
              Your stack was evaluated with transparent pricing logic and explicit rules. The results below are built for leadership reviews, screenshot sharing, and fast next-step decisions.
            </p> */}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Stat title="Current spend" value={`$${formatMoney(report.summary.currentSpend)}`} description={`As of ${generatedOn}`} className="border-cyan-400/15 bg-white/5" />
            <Stat title="Annual savings" value={`$${formatMoney(annualSavings)}`} description="Projected yearly savings" className="border-cyan-400/20 bg-[linear-gradient(180deg,rgba(6,182,212,0.14),rgba(15,23,42,0.66))]" />
            <Stat title="Savings rate" value={`${savingsRate.toFixed(1)}%`} description="Share of current spend" />
          </div>

          {/* <Card className="border-white/10 bg-slate-950/55 p-5 shadow-[0_16px_44px_rgba(2,6,23,0.18)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold tracking-[0.14em] text-slate-200">Spend distribution</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">Provider concentration shows where the audit should focus first.</p>
              </div>
              <div className="rounded-full border border-emerald-400/15 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-emerald-100">
                {report.summary.spendDistribution.concentration} concentration
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {providerBreakdown.map((item) => (
                <div key={item.provider} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-slate-200">{item.provider}</span>
                    <span className="text-slate-400">${formatMoney(item.spend)} · {item.share.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800/90">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-400"
                      style={{ width: `${Math.max(8, item.share)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card> */}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 shadow-[0_12px_36px_rgba(2,6,23,0.16)] backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3 text-slate-300">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-blue-300" />
                <p className="text-sm font-semibold tracking-[0.12em] text-slate-200">Current spend</p>
              </div>
              <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                {generatedOn}
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-white">${formatMoney(report.summary.currentSpend)}</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">Leadership snapshot for the current billing period.</p>
          </div>

          {/* <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 shadow-[0_12px_36px_rgba(2,6,23,0.16)] backdrop-blur-sm sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 text-slate-300">
              <TrendingUp className="h-4 w-4 text-cyan-300" />
              <p className="text-sm font-semibold tracking-[0.12em] text-slate-200">Operating signals</p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/55 p-4">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-400">Rules applied</p>
                <p className="mt-2 text-2xl font-black text-white">{report.auditMetadata.rulesApplied}</p>
                <p className="mt-1 text-xs text-slate-400">of {report.auditMetadata.rulesEvaluated} evaluated</p>
              </div>
              <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/55 p-4">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-400">High confidence</p>
                <p className="mt-2 text-2xl font-black text-white">{report.auditMetadata.highConfidenceRecommendations}</p>
                <p className="mt-1 text-xs text-slate-400">recommendations</p>
              </div>
            </div>
          </div> */}

          <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(56,189,248,0.12),rgba(15,23,42,0.68))] p-4 shadow-[0_12px_36px_rgba(2,6,23,0.16)] backdrop-blur-sm lg:col-span-1">
            <div className="flex items-center gap-2 text-slate-300">
              <BadgeCheck className="h-4 w-4 text-cyan-300" />
              <p className="text-sm font-semibold tracking-[0.12em] text-slate-200">Top opportunity</p>
            </div>
            <p className="mt-2 text-xl font-black text-white">{topTool.name}</p>
            <p className="mt-1 text-sm text-slate-300">${formatMoney(topTool.spend)} monthly spend, or {topTool.percentage.toFixed(1)}% of the stack.</p>
          </div>
        </div>
      </div>
    </section>
  )
}