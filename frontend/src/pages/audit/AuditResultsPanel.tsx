import React from 'react'
import { motion } from 'framer-motion'
import {
  BadgeCheck,
  BarChart3,
  ChevronRight,
  Clock3,
  Crown,
  Gauge,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Wrench
} from 'lucide-react'
import Card from '../../components/ui/Card'
import Stat from '../../components/ui/Stat'
import type { AuditReport, AuditRecommendation, RecommendationCategory } from '../../lib/audit-types'

type Props = {
  report: AuditReport
}

const categoryMeta: Record<RecommendationCategory, { label: string; accent: string; icon: React.ComponentType<{ className?: string }> }> = {
  consolidation: { label: 'Consolidation', accent: 'from-cyan-500 to-blue-500', icon: Wrench },
  negotiation: { label: 'Negotiation', accent: 'from-violet-500 to-fuchsia-500', icon: BadgeCheck },
  'usage-optimization': { label: 'Usage optimization', accent: 'from-emerald-500 to-teal-500', icon: Gauge },
  'plan-optimization': { label: 'Plan optimization', accent: 'from-amber-500 to-orange-500', icon: Crown },
  governance: { label: 'Governance', accent: 'from-sky-500 to-cyan-500', icon: ShieldCheck },
  'seat-optimization': { label: 'Seat optimization', accent: 'from-rose-500 to-red-500', icon: TrendingDown }
}

function formatMoney(amount: number): string {
  return amount.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function getImplementationSteps(implementation: string): string[] {
  return implementation
    .split('\n')
    .map(line => line.trim())
    .map(line => line.replace(/^[-•]\s*/, ''))
    .filter(Boolean)
}

function getReasoningHighlights(reasoning: string): string[] {
  return reasoning
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('-'))
    .slice(0, 4)
    .map(line => line.replace(/^[-•]\s*/, ''))
}

function RecommendationCard({ recommendation, index }: { recommendation: AuditRecommendation; index: number }) {
  const meta = categoryMeta[recommendation.category]
  const Icon = meta.icon
  const steps = getImplementationSteps(recommendation.implementation)
  const highlights = getReasoningHighlights(recommendation.reasoning).slice(0, 3)

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="group rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-5 shadow-xl shadow-slate-950/30 backdrop-blur-xl"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4 lg:flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${meta.accent} px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-lg shadow-black/20`}>
              <Icon className="h-3 w-3" />
              {meta.label}
            </span>
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
              Priority {recommendation.priority}
            </span>
            <span className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
              {recommendation.confidence} confidence
            </span>
          </div>

          <div>
            <h3 className="text-xl font-black tracking-tight text-white">{recommendation.title}</h3>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-300">{recommendation.description}</p>
          </div>
        </div>

        <Card className="min-w-[220px] lg:max-w-xs self-start">
          <div className="flex items-center gap-2 text-slate-300">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            <p className="text-xs font-bold uppercase tracking-[0.2em]">Why this triggered</p>
          </div>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
            {highlights.map(line => (
              <li key={line} className="flex gap-2">
                <ChevronRight className="mt-1 h-3.5 w-3.5 flex-none text-cyan-300" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Stat
          title="Estimated savings"
          value={`$${formatMoney(recommendation.estimatedSavings)}/mo`}
          className="border-emerald-400/15 bg-emerald-400/10"
          compact
        />
        <Stat title="Risk level" value={recommendation.riskLevel} compact />
        <Stat title="Timeframe" value={recommendation.timeframe.replace('-', ' ')} compact />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card>
          <div className="flex items-center gap-2 text-slate-200">
            <BarChart3 className="h-4 w-4 text-blue-300" />
            <p className="text-xs font-bold uppercase tracking-[0.2em]">Implementation</p>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {steps.map(step => (
              <li key={step} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-400" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-slate-200">
            <Clock3 className="h-4 w-4 text-amber-300" />
            <p className="text-xs font-bold uppercase tracking-[0.2em]">Reasoning snapshot</p>
          </div>
          <div className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
            {recommendation.reasoning
              .split('\n')
              .map(line => line.trim())
              .filter(line => line && line !== 'CALCULATION:' && line !== 'DEFENSIBILITY:')
              .slice(0, 5)
              .map(line => (
                <p key={line}>{line}</p>
              ))}
          </div>
        </Card>
      </div>
    </motion.article>
  )
}

export default function AuditResultsPanel({ report }: Props) {
  const savingsRate = report.summary.currentSpend > 0 ? (report.totalEstimatedSavings / report.summary.currentSpend) * 100 : 0

  return (
    <section className="rounded-[2.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] p-5 shadow-[0_20px_70px_rgba(2,6,23,0.55)] md:p-6 lg:p-8">
      <div className="flex flex-col gap-5">
        <div className="space-y-3">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl whitespace-nowrap">Audit results</h2>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-3">
          <Stat
            title="Potential savings"
            value={`$${formatMoney(report.totalEstimatedSavings)}`}
            description={`${savingsRate.toFixed(1)}% of current spend`}
            className="border-emerald-400/20 bg-emerald-400/10"
          />
          <Stat
            title="Rules applied"
            value={report.auditMetadata.rulesApplied}
            description={`of ${report.auditMetadata.rulesEvaluated} evaluated`}
          />
          <Stat
            title="High confidence"
            value={report.auditMetadata.highConfidenceRecommendations}
            description="recommendations"
            className="border-cyan-400/20 bg-cyan-400/10"
          />
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <Stat title="Current spend" value={`$${formatMoney(report.summary.currentSpend)}`} />
        <Stat title="Cost per team member" value={`$${report.summary.costPerTeamMember.toFixed(2)}`} />
        <Stat title="Cost per active user" value={`$${report.summary.costPerActiveUser.toFixed(2)}`} />
        <Stat title="Spend concentration" value={report.summary.spendDistribution.concentration} />
      </div>

      <div className="mt-6 space-y-4">
        {report.recommendations.length > 0 ? (
          report.recommendations.map((recommendation, index) => (
            <RecommendationCard key={recommendation.id} recommendation={recommendation} index={index} />
          ))
        ) : (
          <div className="rounded-[1.75rem] border border-emerald-400/20 bg-emerald-400/10 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
              <BadgeCheck className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-xl font-black text-white">No major issues detected</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Your current spend profile does not trigger any of the deterministic risk rules we defined.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}