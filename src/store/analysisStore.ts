import { create } from 'zustand'
import type { GameAnalysis } from '@/types/analysis'

interface AnalysisStore {
  gameAnalysis: GameAnalysis | null
  isRunning: boolean

  setGameAnalysis: (analysis: GameAnalysis) => void
  updateProgress: (progress: number) => void
  startAnalysis: () => void
  finishAnalysis: () => void
  clearAnalysis: () => void
}

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  gameAnalysis: null,
  isRunning: false,

  setGameAnalysis: (analysis) => set({ gameAnalysis: analysis }),
  updateProgress: (progress) =>
    set((s) => ({
      gameAnalysis: s.gameAnalysis
        ? { ...s.gameAnalysis, progress }
        : null,
    })),
  startAnalysis: () => set({ isRunning: true }),
  finishAnalysis: () => set({ isRunning: false }),
  clearAnalysis: () => set({ gameAnalysis: null, isRunning: false }),
}))
