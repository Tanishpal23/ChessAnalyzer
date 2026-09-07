import { create } from 'zustand'
import type { EngineAnalysis } from '@/types/engine'

interface EngineStore {
  analysis: EngineAnalysis
  isEngineLoaded: boolean
  engineError: string | null

  // Actions
  setAnalysis: (analysis: EngineAnalysis) => void
  setEngineLoaded: (loaded: boolean) => void
  setEngineError: (error: string | null) => void
  clearAnalysis: () => void
}

const defaultAnalysis: EngineAnalysis = {
  depth: 0,
  evaluation: null,
  mate: null,
  bestMoveUci: null,
  bestMoveSan: null,
  variations: [],
  nodes: 0,
  nps: 0,
  isAnalyzing: false,
  isReady: false,
}

export const useEngineStore = create<EngineStore>((set) => ({
  analysis: defaultAnalysis,
  isEngineLoaded: false,
  engineError: null,

  setAnalysis: (analysis) => set({ analysis }),
  setEngineLoaded: (loaded) =>
    set((s) => ({
      isEngineLoaded: loaded,
      analysis: { ...s.analysis, isReady: loaded },
    })),
  setEngineError: (error) => set({ engineError: error }),
  clearAnalysis: () => set({ analysis: defaultAnalysis }),
}))
