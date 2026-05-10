import React, { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Copy, ExternalLink, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import AuditResultsPanel from '../AuditResultsPanel'
import { useAuditResultsStore } from '../../../lib/audit-results-store'
import ResultsEmptyState from './ResultsEmptyState'
import ResultsHero from './ResultsHero'
import ResultsCTA from './ResultsCTA'
import ToolBreakdownGrid from './ToolBreakdownGrid'

function formatMoney(amount: number): string {
  return amount.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export default function AuditResultsPage() {
  const report = useAuditResultsStore((state) => state.latestReport)
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiFallback, setAiFallback] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const resultsUrl = useMemo(() => `${window.location.origin}/audit/results`, [])

  // Fetch AI summary on mount
  useEffect(() => {
    let mounted = true
    const load = async () => {
      setAiLoading(true)
      setAiError(null)
      try {
        const resp = await fetch('/audit/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report)
        })
        if (!mounted) return
        if (!resp.ok) throw new Error('Failed to load summary')
        const data = await resp.json()
        setAiSummary(data.summary)
        setAiFallback(data.fallback ?? false)
      } catch (e: any) {
        if (!mounted) return
        setAiError(e?.message ?? 'Error')
      } finally {
        if (!mounted) return
        setAiLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [report])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(resultsUrl)
      setCopyState('copied')
      window.setTimeout(() => setCopyState('idle'), 1800)
    } catch {
      setCopyState('idle')
    }
  }

  if (!report) {
    return <ResultsEmptyState />
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.14),_transparent_28%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.08),_transparent_24%),linear-gradient(180deg,_rgba(2,6,23,1),_rgba(15,23,42,0.98))]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-15 [mask-image:radial-gradient(circle_at_center,black,transparent_85%)]" />
      <div className="pointer-events-none absolute left-[-8rem] top-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-6rem] top-36 h-[28rem] w-[28rem] rounded-full bg-indigo-500/10 blur-3xl" />

      <section className="relative border-b border-white/10">
        <div className="container relative z-10 px-4 py-5 md:px-6 lg:px-8 lg:py-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 shadow-xl shadow-slate-950/20 backdrop-blur-xl">
            <Link
              to="/audit"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-sm font-semibold text-white transition-all hover:border-white/20 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to input
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">
                <Zap className="h-3.5 w-3.5" />
                Generated audit
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition-all hover:border-cyan-300/30 hover:bg-cyan-400/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                <Copy className="h-4 w-4" />
                {copyState === 'copied' ? 'Copied results link' : 'Copy results link'}
              </button>
            </div>
          </div>

          <ResultsHero report={report} />

          <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
            <div className="flex flex-col gap-5">
              <section className="flex flex-1 flex-col rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] p-4 shadow-2xl shadow-slate-950/30 backdrop-blur-xl md:p-6">
                <div className="mb-4 flex items-center gap-2 text-slate-200">
                  <ShieldCheck className="h-4 w-4 text-cyan-300" />
                  <p className="text-xs font-bold uppercase tracking-[0.2em]">Recommendation explanations</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <AuditResultsPanel report={report} />
                </div>
              </section>

              <ToolBreakdownGrid report={report} />
            </div>

            <div className="flex flex-col gap-6 xl:sticky xl:top-6 xl:self-start">
              <ResultsCTA report={report} />

              <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] p-5 shadow-xl shadow-slate-950/30 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-slate-200">
                  <Sparkles className="h-4 w-4 text-cyan-300" />
                  <p className="text-xs font-bold uppercase tracking-[0.2em]">Shareable summary</p>
                </div>
                  <div className="mt-3">
                    {aiLoading ? (
                      <p className="text-sm leading-6 text-slate-300">Generating summary…</p>
                    ) : aiError ? (
                      <p className="text-sm leading-6 text-rose-300">Failed to load summary</p>
                    ) : (
                      <p className="text-sm leading-6 text-slate-300">{aiSummary ?? 'No summary available.'}</p>
                    )}
                    {aiFallback && (
                      <p className="mt-2 text-xs text-amber-300">Displayed summary used a deterministic fallback to avoid unsupported claims.</p>
                    )}
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          setAiLoading(true)
                          setAiError(null)
                          try {
                            const resp = await fetch('/audit/summary', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(report)
                            })
                            if (!resp.ok) throw new Error('Failed')
                            const data = await resp.json()
                            setAiSummary(data.summary)
                            setAiFallback(data.fallback ?? false)
                          } catch (e: any) {
                            setAiError(e?.message ?? 'Error')
                          } finally {
                            setAiLoading(false)
                          }
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white"
                      >
                        Refresh summary
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(aiSummary || '')
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-800/60 px-4 py-2 text-sm font-semibold text-slate-100"
                      >
                        Copy summary
                      </button>
                    </div>
                  </div>
                <a
                  href="mailto:consulting@credex.ai?subject=Credex%20AI%20Spend%20Consultation"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  <ExternalLink className="h-4 w-4" />
                  Book a Credex consultation
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
