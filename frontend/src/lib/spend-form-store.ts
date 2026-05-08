import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { defaultAISpendFormValues, type AISpendFormValues } from './spend-form'

type SpendFormState = {
  draft: AISpendFormValues
  updatedAt: number | null
  setDraft: (draft: AISpendFormValues) => void
  resetDraft: () => void
}

export const useSpendFormStore = create<SpendFormState>()(
  persist(
    (set) => ({
      draft: defaultAISpendFormValues,
      updatedAt: null,
      setDraft: (draft) => set({ draft, updatedAt: Date.now() }),
      resetDraft: () => set({ draft: defaultAISpendFormValues, updatedAt: null })
    }),
    {
      name: 'ai-spend-input-form',
      partialize: (state) => ({ draft: state.draft, updatedAt: state.updatedAt })
    }
  )
)
