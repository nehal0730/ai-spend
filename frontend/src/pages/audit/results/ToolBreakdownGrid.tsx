import React from 'react'
import { BarChart3, LayoutGrid, Users, Wallet } from 'lucide-react'
import type { AuditReport } from '../../../lib/audit-types'

type Props = {
  report: AuditReport
}

function formatMoney(amount: number): string {
  return amount.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export default function ToolBreakdownGrid({ report }: Props) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-200">
            <LayoutGrid className="h-4 w-4 text-cyan-300" />
            <p className="text-xs font-bold uppercase tracking-[0.2em]">Per-tool breakdown</p>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            The stack is sorted by real spend concentration. Each card shows the tool’s share, its seat footprint, and how aggressively it should be reviewed.
          </p>
        </div>

        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
          {report.summary.toolCount} tools reviewed
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {report.input.tools.map((tool) => {
          const spendShare = report.summary.currentSpend > 0 ? (tool.monthlySpend / report.summary.currentSpend) * 100 : 0
          const shareLabel = spendShare >= 40 ? 'Spend anchor' : spendShare >= 20 ? 'High leverage' : 'Supporting tool'
          const isTopTool = report.summary.topExpensiveTool.name === tool.toolName

          return (
            <article
              key={`${tool.provider}-${tool.toolName}`}
              className="group relative overflow-hidden rounded-[1.55rem] border border-white/10 bg-slate-950/70 p-4 shadow-lg shadow-slate-950/20 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/20 hover:shadow-cyan-950/10 flex flex-col justify-between min-h-[240px]"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 opacity-80 transition-opacity group-hover:opacity-100" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200">{tool.provider}</p>
                  <h3 className="mt-1 text-lg font-black tracking-tight text-white">{tool.toolName}</h3>
                </div>
                <div className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${isTopTool ? 'border border-amber-400/20 bg-amber-400/10 text-amber-100' : 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-200'}`}>
                  {shareLabel}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Wallet className="h-4 w-4 text-emerald-300" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] leading-tight">Monthly spend</p>
                  </div>
                  <p className="mt-2 text-xl font-black text-white">${formatMoney(tool.monthlySpend)}</p>
                </div>

                <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Users className="h-4 w-4 text-indigo-300" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] leading-tight">Active seats</p>
                  </div>
                  <p className="mt-2 text-xl font-black text-white">{tool.activeSeats}</p>
                </div>

                <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-3 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-2 text-slate-300">
                    <BarChart3 className="h-4 w-4 text-cyan-300" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] leading-tight">Spend share</p>
                  </div>
                  <p className="mt-2 text-xl font-black text-white">{spendShare.toFixed(1)}%</p>
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800/90">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400"
                  style={{ width: `${Math.max(6, spendShare)}%` }}
                />
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}