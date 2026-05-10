import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuditReport } from './audit-types'

type AuditResultsState = {
  latestReport: AuditReport | null
  setLatestReport: (report: AuditReport) => void
  clearLatestReport: () => void
}

export const useAuditResultsStore = create<AuditResultsState>()(
  persist(
    (set) => ({
      latestReport: null,
      setLatestReport: (report) => set({ latestReport: report }),
      clearLatestReport: () => set({ latestReport: null })
    }),
    {
      name: 'ai-spend-audit-results',
      partialize: (state) => ({ latestReport: state.latestReport })
    }
  )
)