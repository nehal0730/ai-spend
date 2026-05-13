import React from 'react'
import { ArrowRight, BadgeCheck, CheckCircle2, Sparkles, TrendingUp } from 'lucide-react'
import Stat from '../../../components/ui/Stat'
import Card from '../../../components/ui/Card'
import type { AuditReport } from '../../../lib/audit-types'

type Props = {
  report: AuditReport
}

function formatMoney(amount: number): string {
  return amount.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function getRecommendationSummaryText(recommendation: { reasoning: string; description: string } | null): string {
  if (!recommendation) {
    return 'Cut the largest waste, then revisit the rest of the stack.'
  }

  const lines = recommendation.reasoning
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const summaryLine = lines.find((line) => !/^(calculation|reasoning|summary|impact):?$/i.test(line))
  return summaryLine || recommendation.description || 'Cut the largest waste, then revisit the rest of the stack.'
}

export default function ResultsHero({ report }: Props) {
  const monthlySavings = report.totalEstimatedSavings
  const annualSavings = monthlySavings * 12
  const savingsRate = report.summary.currentSpend > 0 ? (monthlySavings / report.summary.currentSpend) * 100 : 0
  const topTool = report.summary.topExpensiveTool
  const topRecommendation = report.recommendations[0] ?? null
  const planLabel = report.input.currentPlan
  const seatRatio = report.input.teamSize > 0 ? report.input.seatCount / report.input.teamSize : 0

  const generatedOn = new Date(report.timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(241,245,249,0.98))] p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:p-7 lg:p-8 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] dark:shadow-[0_24px_80px_rgba(2,6,23,0.5)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(6,182,212,0.08),_transparent_26%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.06),_transparent_24%)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.12),_transparent_26%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.08),_transparent_24%)]" />
      <div className="relative grid gap-6 lg:grid-cols-[1.26fr_0.94fr] lg:items-start">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-200">
              <BadgeCheck className="h-3.5 w-3.5" />
              Deterministic audit complete
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" />
              {planLabel} plan reviewed
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-soft dark:text-slate-400">Executive summary</p>
            <h1 className="max-w-4xl text-3xl font-black tracking-tight text-primary md:text-4xl lg:text-4xl dark:text-white">
              One clear move can unlock
              <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent"> ${formatMoney(annualSavings)} in annual savings.</span>
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-muted md:text-base dark:text-slate-300">
              The stack is concentrated in <span className="font-semibold text-primary dark:text-white">{topTool.name}</span>, and the strongest opportunity is to
              <span className="font-semibold text-primary dark:text-white"> {topRecommendation?.title || 'trim overprovisioned spend'}</span> before looking anywhere else.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Stat title="Current spend" value={`$${formatMoney(report.summary.currentSpend)}`} description={`As of ${generatedOn}`} className="border-cyan-400/15" />
            <Stat title="Immediate savings" value={`$${formatMoney(monthlySavings)}`} description="Per month, if you act now" className="border-cyan-400/20 bg-[linear-gradient(180deg,rgba(6,182,212,0.08),rgba(255,255,255,0.92))] dark:bg-[linear-gradient(180deg,rgba(6,182,212,0.14),rgba(15,23,42,0.66))]" />
            <Stat title="Savings rate" value={`${savingsRate.toFixed(1)}%`} description="Share of current spend" />
          </div>
        </div>


        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(6,182,212,0.08),rgba(255,255,255,0.94))] p-4 shadow-[0_12px_36px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:bg-[linear-gradient(180deg,rgba(56,189,248,0.12),rgba(15,23,42,0.68))] dark:shadow-[0_12px_36px_rgba(2,6,23,0.16)] lg:col-span-1">
            <div className="flex items-center gap-2 text-muted">
              <TrendingUp className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
              <p className="text-sm font-semibold tracking-[0.12em] text-primary dark:text-slate-200">Why it matters</p>
            </div>
            <p className="mt-1 text-sm leading-5 text-muted dark:text-slate-300">
              {report.recommendations.length > 0
                ? `${report.recommendations.length} recommendation${report.recommendations.length !== 1 ? 's' : ''} were identified, but the first one is the leverage point to act on now.`
                : 'No savings opportunities were found that justify immediate action.'}
            </p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[1.1rem] border border-white/70 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-soft">Largest cost center</p>
                <p className="mt-2 text-xl font-black text-primary dark:text-white">{topTool.name}</p>
                <p className="mt-1 text-xs leading-5 text-muted dark:text-slate-300">${formatMoney(topTool.spend)} per month</p>
              </div>
              <div className="rounded-[1.1rem] border border-white/70 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-soft">Expected outcome</p>
                <p className="mt-2 text-xl font-black text-primary dark:text-white">${formatMoney(monthlySavings)} / mo</p>
                <p className="mt-1 text-xs leading-5 text-muted dark:text-slate-300">${formatMoney(annualSavings)} per year if the top opportunity is implemented.</p>
              </div>
            </div>
          </div>
        </div>


        <div className="lg:col-span-2">
          <Card className="border-cyan-400/15 bg-white/70 p-5 shadow-[0_16px_44px_rgba(2,6,23,0.10)] backdrop-blur-sm dark:bg-slate-950/55 dark:shadow-[0_16px_44px_rgba(2,6,23,0.18)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200">Top opportunity</p>
                <h2 className="mt-2 text-lg font-black tracking-tight text-primary dark:text-white">
                  {topRecommendation?.title || 'Reduce the highest-cost tool first'}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted dark:text-slate-300">
                  {topRecommendation?.description || 'Start with the largest cost center. It is usually the fastest lever for meaningful savings.'}
                </p>
              </div>
              <div className="rounded-[1.35rem] border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-right">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-200">Best-case monthly savings</p>
                <p className="mt-1 text-3xl font-black tracking-tight text-emerald-800 dark:text-emerald-100">${formatMoney(monthlySavings)}</p>
                <p className="mt-1 text-xs text-emerald-900/70 dark:text-emerald-100/70">${formatMoney(annualSavings)} annually</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-[1.2rem] border border-surface bg-white p-4 dark:bg-slate-950/60">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-soft">Top tool share</p>
                <p className="mt-2 text-2xl font-black text-primary dark:text-white">{topTool.percentage.toFixed(1)}%</p>
                <p className="mt-1 text-xs leading-5 text-muted dark:text-slate-300">{topTool.name} is the largest leverage point.</p>
              </div>
              <div className="rounded-[1.2rem] border border-surface bg-white p-4 dark:bg-slate-950/60">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-soft">Plan fit</p>
                <p className="mt-2 text-2xl font-black text-primary dark:text-white">{planLabel}</p>
                <p className="mt-1 text-xs leading-5 text-muted dark:text-slate-300">Seat ratio {seatRatio.toFixed(1)}x. Review whether the current tier matches actual usage.</p>
              </div>
              <div className="rounded-[1.2rem] border border-surface bg-white p-4 dark:bg-slate-950/60">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-soft">Executive action</p>
                <p className="mt-2 text-2xl font-black text-primary dark:text-white">{topRecommendation ? 'Act first' : 'Review first'}</p>
                <p className="mt-1 text-xs leading-5 text-muted dark:text-slate-300">{topRecommendation?.implementation || 'Cut the largest waste, then revisit the rest of the stack.'}</p>
              </div>
            </div>

            {topRecommendation ? (
              <div className="mt-5 rounded-[1.35rem] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-muted">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                    <p className="text-xs font-bold uppercase tracking-[0.18em]">Concise action summary</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-800 dark:text-cyan-200">
                    <ArrowRight className="h-3.5 w-3.5" />
                    {topRecommendation.priority === 1 ? 'High priority' : 'Secondary priority'}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted dark:text-slate-300">{getRecommendationSummaryText(topRecommendation)}</p>
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </section>
  )
}