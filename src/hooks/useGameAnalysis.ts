import { useState, useCallback, useRef } from 'react'
import { useChessStore } from '@/store/chessStore'
import { useAnalysisStore } from '@/store/analysisStore'
import { GameReviewRunner } from '@/analysis/gameReviewRunner'
import { GAME_ANALYSIS_DEPTH } from '@/utils/constants'

export function useGameAnalysis() {
  const moveHistory = useChessStore((s) => s.moveHistory)
  const gameAnalysis = useAnalysisStore((s) => s.gameAnalysis)
  const isRunning = useAnalysisStore((s) => s.isRunning)
  const setGameAnalysis = useAnalysisStore((s) => s.setGameAnalysis)
  const startAnalysisState = useAnalysisStore((s) => s.startAnalysis)
  const finishAnalysisState = useAnalysisStore((s) => s.finishAnalysis)
  const clearAnalysis = useAnalysisStore((s) => s.clearAnalysis)

  const [currentStep, setCurrentStep] = useState<number>(0)
  const [totalSteps, setTotalSteps] = useState<number>(0)
  const runnerRef = useRef<GameReviewRunner | null>(null)

  const runGameAnalysis = useCallback(async () => {
    if (moveHistory.length === 0 || isRunning) return

    startAnalysisState()
    const total = moveHistory.length + 1
    setTotalSteps(total)
    setCurrentStep(0)

    const runner = new GameReviewRunner()
    runnerRef.current = runner

    try {
      const result = await runner.analyzeGame(
        moveHistory,
        GAME_ANALYSIS_DEPTH,
        (current, totalCount) => {
          setCurrentStep(current)
          setTotalSteps(totalCount)
        }
      )
      setGameAnalysis(result)
    } catch (err) {
      if ((err as Error)?.message !== 'Analysis cancelled') {
        console.error('Game analysis error:', err)
      }
    } finally {
      finishAnalysisState()
      runnerRef.current = null
    }
  }, [moveHistory, isRunning, startAnalysisState, finishAnalysisState, setGameAnalysis])

  const cancelGameAnalysis = useCallback(() => {
    if (runnerRef.current) {
      runnerRef.current.cancel()
      runnerRef.current = null
    }
    finishAnalysisState()
  }, [finishAnalysisState])

  return {
    gameAnalysis,
    isRunning,
    progress: totalSteps > 0 ? currentStep / totalSteps : 0,
    currentStep,
    totalSteps,
    runGameAnalysis,
    cancelGameAnalysis,
    clearAnalysis,
  }
}
