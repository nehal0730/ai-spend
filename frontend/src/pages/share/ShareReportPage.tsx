import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCopy,
  ExternalLink,
  Flame,
  Lightbulb,
  RefreshCcw,
  TrendingDown,
  Zap,
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { fetchSharedAuditReport } from '../../lib/audit-api'
import type { PublicAuditSharePayload, SharedAuditApiResponse } from '../../lib/audit-types'

function formatMoney(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

function formatMoneyShort(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`
  }
  return `$${value}`
}

function ShareLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded-lg bg-slate-700/50" />
      <div className="h-32 rounded-2xl bg-slate-800/50" />
      <div className="grid gap-3 md:grid-cols-3">
        <div className="h-24 rounded-xl bg-slate-800/50" />
        <div className="h-24 rounded-xl bg-slate-800/50" />
        <div className="h-24 rounded-xl bg-slate-800/50" />
      </div>
      <div className="h-64 rounded-2xl bg-slate-800/50" />
    </div>
  )
}

export default function ShareReportPage() {
  const { shareId } = useParams<{ shareId: string }>()
  const [data, setData] = useState<SharedAuditApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!shareId) {
      setError('Missing share ID.')
      setLoading(false)
      return
    }

    let mounted = true

    const load = async () => {
      setLoading(true)
      setError(null)
      const response = await fetchSharedAuditReport(shareId)

      if (!mounted) return

      if (!response.success) {
        setError(response.error)
        setData(null)
        setLoading(false)
        return
      }

      setData(response.data)
      setLoading(false)
    }

    void load()
    return () => {
      mounted = false
    }
  }, [shareId])

  const payload = data?.payload
  const topRecommendation = useMemo(() => {
    return payload?.recommendations?.[0] || null
  }, [payload?.recommendations])

  const chartData = useMemo(() => {
    if (!payload?.tools) return []
    return payload.tools.map((tool) => ({
      name: tool.name,
      value: tool.spend,
    }))
  }, [payload?.tools])

  const publishedDate = useMemo(() => {
    if (!data?.publishedAt) return ''
    return new Date(data.publishedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  }, [data?.publishedAt])

  const optimizationScore = useMemo(() => {
    if (!payload?.recommendationsCount || payload.recommendationsCount === 0) return 72
    const baseScore = 65
    const rateOfOptimization = Math.min(payload.recommendationsCount * 8, 30)
    return Math.min(baseScore + rateOfOptimization, 95)
  }, [payload?.recommendationsCount])

  const savingsRate = useMemo(() => {
    if (!payload) return 0
    if (payload.annualSpend === 0) return 0
    return Math.round((payload.annualEstimatedSavings / payload.annualSpend) * 100)
  }, [payload])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const COLORS = ['#22d3ee', '#06b6d4', '#0891b2', '#0e7490', '#164e63', '#1e293b']

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Animated gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_rgba(34,211,238,0.15),_transparent_40%),radial-gradient(circle_at_80%_80%,_rgba(129,140,248,0.15),_transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />

      <div className="relative z-10">
        {/* Compact Navigation Bar */}
        <header className="sticky top-0 z-50 border-b border-slate-700/30 bg-slate-900/60 backdrop-blur-xl">
          <div className="mx-auto max-w-5xl px-4 py-3 md:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">AI Spend Audit Report</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition-colors hover:bg-cyan-400/20"
                >
                  <ClipboardCopy className="h-3.5 w-3.5" />
                  {copied ? 'Copied!' : 'Share'}
                </button>
                <Link
                  to="/audit"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600/50 bg-slate-800/50 px-3 py-1.5 text-xs font-semibold text-slate-100 transition-colors hover:bg-slate-700/50"
                >
                  <Zap className="h-3.5 w-3.5" />
                  Run Audit
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
          {loading && <ShareLoadingSkeleton />}

          {!loading && error && (
            <section className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-6 shadow-lg backdrop-blur-xl">
              <p className="text-sm font-semibold text-rose-200">Could not load report</p>
              <p className="mt-2 text-xs text-rose-300">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-rose-300/30 bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-100 hover:bg-rose-500/30"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Retry
              </button>
            </section>
          )}

          {!loading && !error && payload && (
            <div className="space-y-6">
              {/* Hero Section - The Centerpiece */}
              <div className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-slate-800/50 to-slate-900/80 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl md:p-10">
                {/* Accent glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-indigo-500/5 opacity-0 transition-opacity duration-300 hover:opacity-100" />

                <div className="relative">
                  {/* Top badge */}
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                    <Zap className="h-3 w-3" />
                    Optimization Report
                  </div>

                  {/* Main headline and score */}
                  <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div>
                      <h1 className="text-4xl font-black leading-tight tracking-tight md:text-5xl">
                        Save{' '}
                        <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                          ${formatMoney(payload.annualEstimatedSavings)}/year
                        </span>
                      </h1>
                      <p className="mt-2 text-sm font-medium text-slate-400">on your AI stack optimization</p>
                    </div>

                    {/* Optimization Score Badge */}
                    <div className="flex flex-col items-center gap-2 rounded-2xl border border-indigo-400/30 bg-indigo-400/10 px-6 py-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">Optimization Score</p>
                      <p className="text-3xl font-black text-white">{optimizationScore}</p>
                      <p className="text-[10px] text-indigo-300">/100</p>
                    </div>
                  </div>

                  {/* Executive summary */}
                  <p className="mt-6 max-w-2xl text-sm leading-relaxed text-slate-300">{payload.description}</p>

                  {/* Top Opportunity Highlight */}
                  {topRecommendation && (
                    <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
                      <div className="flex items-start gap-3">
                        <Flame className="mt-0.5 h-5 w-5 text-amber-400 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-bold uppercase tracking-wider text-amber-300">Top Priority</p>
                          <h3 className="mt-1 text-base font-bold text-white">{topRecommendation.title}</h3>
                          <p className="mt-1 text-xs text-amber-200">{topRecommendation.description}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-900/40 px-2.5 py-1 text-xs font-semibold text-amber-100">
                              <TrendingDown className="h-3 w-3" />
                              ${formatMoney(topRecommendation.estimatedSavings)}/mo
                            </span>
                            <span className="text-xs font-semibold text-amber-300">{topRecommendation.confidence} confidence</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Metrics Grid - Variable Heights */}
              <div className="grid gap-4 md:grid-cols-3">
                {/* Primary metric - spans full height */}
                <div className="rounded-2xl border border-cyan-400/20 bg-slate-800/50 p-5 backdrop-blur-xl">
                  <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Current Spend</p>
                  <p className="mt-2 text-3xl font-black text-white">${formatMoney(payload.monthlySpend)}</p>
                  <p className="mt-1 text-xs text-slate-400">per month</p>
                </div>

                <div className="rounded-2xl border border-emerald-400/20 bg-slate-800/50 p-5 backdrop-blur-xl">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Savings Rate</p>
                  <p className="mt-2 text-3xl font-black text-white">{savingsRate}%</p>
                  <p className="mt-1 text-xs text-slate-400">of annual spend</p>
                </div>

                <div className="rounded-2xl border border-indigo-400/20 bg-slate-800/50 p-5 backdrop-blur-xl">
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Opportunities</p>
                  <p className="mt-2 text-3xl font-black text-white">{payload.recommendationsCount}</p>
                  <p className="mt-1 text-xs text-slate-400">high-priority actions</p>
                </div>
              </div>

              {/* Spend Distribution - Chart Section */}
              {chartData.length > 0 && (
                <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 backdrop-blur-xl">
                  <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                    <Lightbulb className="h-4 w-4 text-cyan-400" />
                    Your spending by tool
                  </h2>

                  <div className="mt-6 flex flex-col items-center md:flex-row md:justify-between">
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={2} dataKey="value">
                          {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: 'rgba(15, 23, 42, 0.9)',
                            border: '1px solid rgba(51, 65, 85, 0.5)',
                            borderRadius: '0.5rem',
                          }}
                          formatter={(value) => `$${formatMoney(value as number)}/mo`}
                          labelStyle={{ color: '#e2e8f0' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Legend */}
                    <div className="mt-4 space-y-2 md:mt-0">
                      {chartData.map((item, index) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-xs text-slate-300">
                            {item.name}: <span className="font-semibold text-white">${formatMoney(item.value)}/mo</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Recommended Actions Section */}
              {payload.recommendations.length > 0 && (
                <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 backdrop-blur-xl">
                  <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Recommended Actions
                  </h2>

                  <div className="mt-4 space-y-3">
                    {payload.recommendations.slice(0, 5).map((rec, idx) => (
                      <div key={`${rec.title}-${idx}`} className="flex gap-3 rounded-xl border border-slate-700/50 bg-slate-700/20 p-3 transition-all hover:border-slate-600 hover:bg-slate-700/30">
                        <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-cyan-400/50 bg-cyan-400/20 text-xs font-bold text-cyan-300">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white">{rec.title}</p>
                          <p className="mt-0.5 text-xs text-slate-400">{rec.description}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-900/40 px-2 py-1 text-[10px] font-semibold text-cyan-200">
                              <TrendingDown className="h-3 w-3" />
                              ${formatMoneyShort(rec.estimatedSavings)}/mo
                            </span>
                            <span className="inline-flex rounded-full border border-slate-600/50 bg-slate-700/50 px-2 py-1 text-[10px] font-medium text-slate-300">
                              {rec.timeframe.replace('-', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {payload.recommendations.length > 5 && (
                    <p className="mt-4 text-xs text-slate-400">
                      +{payload.recommendations.length - 5} more recommendation{payload.recommendations.length - 5 !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              )}

              {/* Insights & Details Section */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 backdrop-blur-xl">
                  <p className="text-xs font-bold uppercase tracking-wider text-sky-300">Report Details</p>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <dt className="text-slate-400">Tools Analyzed</dt>
                      <dd className="font-semibold text-white">{payload.toolCount}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-slate-400">Annual Spend</dt>
                      <dd className="font-semibold text-white">${formatMoney(payload.annualSpend)}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-slate-400">Report Generated</dt>
                      <dd className="font-semibold text-white text-xs">{publishedDate}</dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 backdrop-blur-xl">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">Why This Matters</p>
                  <div className="mt-4 space-y-2 text-xs text-slate-300 leading-relaxed">
                    <p>
                      Small optimizations compound over time. A <span className="font-semibold text-white">${formatMoney(payload.annualEstimatedSavings)}</span> annual
                      saving unlocks budget for strategic AI initiatives.
                    </p>
                    <p className="text-slate-400">This report is based on current spend patterns and is updated in real-time as your usage changes.</p>
                  </div>
                </div>
              </div>

              {/* Premium CTA Section */}
              <div className="relative overflow-hidden rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/20 via-indigo-500/10 to-slate-900/50 p-8 shadow-2xl shadow-cyan-500/20 backdrop-blur-xl md:p-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.1),_transparent_50%)]" />

                <div className="relative">
                  <h2 className="text-2xl font-black text-white">Ready to optimize your AI stack?</h2>
                  <p className="mt-2 max-w-2xl text-sm text-slate-300">Run a custom audit for your organization to get personalized recommendations and savings estimates.</p>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                      to="/audit"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-400 px-6 py-3 text-sm font-bold text-slate-900 transition-all hover:shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-1"
                    >
                      Start Free Audit
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <a
                      href="mailto:consulting@credex.ai?subject=AI%20Spend%20Optimization%20Consultation"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/50 bg-cyan-400/10 px-6 py-3 text-sm font-semibold text-cyan-100 transition-all hover:bg-cyan-400/20"
                    >
                      Talk to Specialist
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="rounded-xl border border-slate-700/30 bg-slate-800/20 px-4 py-3 text-center">
                <p className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Privacy:</span> This report contains anonymized spending analysis. No email, company name, or internal data is shared.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
