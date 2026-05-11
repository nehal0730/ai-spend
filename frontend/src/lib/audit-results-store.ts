import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuditReport, AuditShareLink } from './audit-types'

type AuditResultsState = {
  latestReport: AuditReport | null
  latestShare: AuditShareLink | null
  setLatestResult: (report: AuditReport, share: AuditShareLink) => void
  clearLatestReport: () => void
}

export const useAuditResultsStore = create<AuditResultsState>()(
  persist(
    (set) => ({
      latestReport: null,
      latestShare: null,
      setLatestResult: (report, share) => set({ latestReport: report, latestShare: share }),
      clearLatestReport: () => set({ latestReport: null, latestShare: null })
    }),
    {
      name: 'ai-spend-audit-results',
      partialize: (state) => ({ latestReport: state.latestReport, latestShare: state.latestShare })
    }
  )
)