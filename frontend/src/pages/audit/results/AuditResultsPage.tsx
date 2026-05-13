import React, { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Copy, ExternalLink, Sparkles, Zap } from 'lucide-react'
import AuditResultsPanel from '../AuditResultsPanel'
import { useAuditResultsStore } from '../../../lib/audit-results-store'
import { getApiBaseUrl } from '../../../lib/api-base'
import ResultsEmptyState from './ResultsEmptyState'
import ResultsHero from './ResultsHero'
import ResultsCTA from './ResultsCTA'
import ToolBreakdownGrid from './ToolBreakdownGrid'
import Card from '../../../components/ui/Card'
import EmailReportModal from '../../../components/lead-capture/EmailReportModal'
import SuccessToast from '../../../components/lead-capture/SuccessToast'
import type { LeadCaptureMode } from '../../../lib/lead-capture-types'

function formatMoney(amount: number): string {
  return amount.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function isUsableShareUrl(value?: string | null): value is string {
  if (!value) return false

  try {
    const parsed = new URL(value)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false

    const host = parsed.hostname.toLowerCase()
    if (host === 'localhost' || host === '127.0.0.1') return false
    if (host.endsWith('.local') || host.includes('placeholder')) return false

    return true
  } catch {
    return false
  }
}

function buildFallbackShareUrl(shareId: string): string {
  const encodedShareId = encodeURIComponent(shareId)

  try {
    return `${new URL(getApiBaseUrl()).origin}/share/${encodedShareId}`
  } catch {
    return `${window.location.origin}/share/${encodedShareId}`
  }
}

export default function AuditResultsPage() {
  const report = useAuditResultsStore((state) => state.latestReport)
  const latestShare = useAuditResultsStore((state) => state.latestShare)
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const [leadCaptureMode, setLeadCaptureMode] = useState<LeadCaptureMode | null>(null)
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiFallback, setAiFallback] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const resultsUrl = useMemo(() => {
    if (isUsableShareUrl(latestShare?.publicUrl)) return latestShare.publicUrl
    if (isUsableShareUrl(latestShare?.frontendUrl)) return latestShare.frontendUrl
    if (latestShare?.shareId) return buildFallbackShareUrl(latestShare.shareId)
    return `${window.location.origin}/audit/results`
  }, [latestShare?.frontendUrl, latestShare?.publicUrl, latestShare?.shareId])
  const generatedOn = report ? new Date(report.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : ''
  const topToolShare = report?.summary.topExpensiveTool.percentage ?? 0
  const reportTitle = report ? `AI Spend Audit report for ${report.input.currentPlan} teams` : 'AI Spend Audit report'

  useEffect(() => {
    if (!toast) return

    const timeout = window.setTimeout(() => setToast(null), 3000)
    return () => window.clearTimeout(timeout)
  }, [toast])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setAiLoading(true)
      setAiError(null)
      try {
        const resp = await fetch(`${getApiBaseUrl()}/audit/summary`, {
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
    <main className="relative min-h-screen overflow-hidden bg-app text-primary">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(6,182,212,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.12),_transparent_28%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.08),_transparent_24%),linear-gradient(180deg,_rgba(248,250,252,1),_rgba(241,245,249,0.98))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.14),_transparent_28%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.08),_transparent_24%),linear-gradient(180deg,_rgba(2,6,23,1),_rgba(15,23,42,0.98))]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20 [mask-image:radial-gradient(circle_at_center,black,transparent_85%)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)]" />
      <div className="pointer-events-none absolute left-[-8rem] top-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-6rem] top-36 h-[28rem] w-[28rem] rounded-full bg-indigo-500/10 blur-3xl" />

      <section className="relative border-b border-surface">
        <div className="container max-w-7xl mx-auto relative z-10 px-4 py-5 md:px-6 lg:px-8 lg:py-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-surface bg-surface px-4 py-3 shadow-xl shadow-slate-950/10 backdrop-blur-xl">
            <Link
              to="/audit"
              className="inline-flex items-center gap-2 rounded-full border border-surface bg-white px-4 py-2 text-sm font-semibold text-primary transition-all hover:border-surface hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:bg-slate-950/60 dark:text-white dark:hover:bg-white/10 dark:focus-visible:ring-offset-slate-950"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to input
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-200">
                <Zap className="h-3.5 w-3.5" />
                Generated audit
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-700 transition-all hover:border-cyan-300/30 hover:bg-cyan-400/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:text-cyan-100 dark:focus-visible:ring-offset-slate-950"
              >
                <Copy className="h-4 w-4" />
                {copyState === 'copied' ? 'Copied share link' : 'Copy share link'}
              </button>
            </div>
          </div>

          <ResultsHero report={report} />

          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7 flex flex-col gap-5">
              <section className="rounded-[2rem] border border-surface bg-surface p-4 shadow-2xl shadow-slate-950/10 backdrop-blur-xl md:p-6">
                <div className="mb-4 text-muted">
                  <p className="text-xs font-bold uppercase tracking-[0.2em]">Recommendation explanations</p>
                </div>
                <div>
                  <AuditResultsPanel report={report} />
                </div>
              </section>

              <Card>
                <div className="flex items-center gap-2 text-muted">
                  <Sparkles className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                  <p className="text-xs font-bold uppercase tracking-[0.2em]">Shareable summary</p>
                </div>
                <div className="mt-3">
                  {aiLoading ? (
                    <p className="text-sm leading-6 text-muted">Generating summary…</p>
                  ) : aiError ? (
                    <p className="text-sm leading-6 text-rose-600 dark:text-rose-300">Failed to load summary</p>
                  ) : (
                    <p className="text-sm leading-6 text-muted">{aiSummary ?? 'No summary available.'}</p>
                  )}
                  {aiFallback && (
                    <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">Displayed summary used a deterministic fallback to avoid unsupported claims.</p>
                  )}
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        setAiLoading(true)
                        setAiError(null)
                        try {
                          const resp = await fetch(`${getApiBaseUrl()}/audit/summary`, {
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
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-primary dark:bg-slate-800/60 dark:text-slate-100"
                    >
                      Copy summary
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLeadCaptureMode('contact')}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-950"
                >
                  <ExternalLink className="h-4 w-4" />
                  Book a consultation
                </button>
              </Card>
            </div>

            <aside className="lg:col-span-5 flex flex-col gap-6">
              <Card>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-muted">
                    <CalendarDays className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                    <p className="text-xs font-bold uppercase tracking-[0.2em]">Decision context</p>
                  </div>
                  <span className="rounded-full border border-surface bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-soft dark:bg-slate-950/60 dark:text-slate-300">
                    {generatedOn}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-[1.25rem] border border-surface bg-white p-4 dark:bg-slate-950/70">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-soft">Recommendations</p>
                    <p className="mt-2 text-3xl font-black text-primary dark:text-white">{report.recommendations.length}</p>
                    <p className="mt-1 text-xs leading-5 text-muted dark:text-slate-300">Rule-based actions tied to the detected savings opportunity.</p>
                  </div>

                  <div className="rounded-[1.25rem] border border-surface bg-white p-4 dark:bg-slate-950/70">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-soft">Rules applied</p>
                    <p className="mt-2 text-3xl font-black text-primary dark:text-white">{report.auditMetadata.rulesApplied}/{report.auditMetadata.rulesEvaluated}</p>
                    <p className="mt-1 text-xs leading-5 text-soft">Deterministic engine coverage for the current stack.</p>
                  </div>

                  <div className="rounded-[1.25rem] border border-surface bg-white p-4 sm:col-span-2 xl:col-span-1 dark:bg-slate-950/70">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-soft">Spend concentration</p>
                    <p className="mt-2 text-3xl font-black text-primary dark:text-white">{topToolShare.toFixed(1)}%</p>
                    <p className="mt-1 text-xs leading-5 text-soft">Largest tool share of total spend, used to judge focus and urgency.</p>
                  </div>
                </div>
              </Card>

              <ResultsCTA
                report={report}
                onRequestEmail={() => setLeadCaptureMode('report')}
                onRequestConsultation={() => setLeadCaptureMode('contact')}
              />

              <div>
                <ToolBreakdownGrid report={report} />
              </div>
            </aside>
          </div>
        </div>
      </section>

      <EmailReportModal
        open={leadCaptureMode !== null}
        onClose={() => setLeadCaptureMode(null)}
        mode={leadCaptureMode || 'report'}
        source="audit_results"
        title={leadCaptureMode === 'contact' ? 'Request a follow-up consultation' : 'Email me this audit report'}
        description={leadCaptureMode === 'contact' ? 'Tell us what you want help with and we will follow up with practical next steps.' : 'Send the report to your inbox so you can share it with your team or keep it handy.'}
        shareId={latestShare?.shareId}
        reportTitle={reportTitle}
        reportUrl={resultsUrl}
        submitLabel={leadCaptureMode === 'contact' ? 'Request consultation' : 'Email report'}
        onSuccess={(message) => {
          setToast({
            title: leadCaptureMode === 'contact' ? 'Consultation request sent' : 'Report email requested',
            message
          })
          setLeadCaptureMode(null)
        }}
      />

      <SuccessToast
        open={toast !== null}
        title={toast?.title || ''}
        message={toast?.message || ''}
        onClose={() => setToast(null)}
      />
    </main>
  )
}

