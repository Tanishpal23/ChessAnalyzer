import { useEffect, useRef } from 'react'
import { engine } from '@/engine/StockfishEngine'
import { useEngineStore } from '@/store/engineStore'
import { useChessStore } from '@/store/chessStore'
import { useAnalysisStore } from '@/store/analysisStore'
import { DEFAULT_ANALYSIS_DEPTH, DEFAULT_MULTIPV } from '@/utils/constants'

/**
 * useStockfish — manages the Stockfish engine lifecycle and
 * triggers real-time analysis whenever the current FEN changes.
 *
 * This hook should be mounted once at the app root level.
 */
export function useStockfish() {
  const setAnalysis = useEngineStore((s) => s.setAnalysis)
  const setEngineLoaded = useEngineStore((s) => s.setEngineLoaded)
  const setEngineError = useEngineStore((s) => s.setEngineError)
  const clearAnalysis = useEngineStore((s) => s.clearAnalysis)

  const currentFen = useChessStore((s) => s.currentFen)
  const gameMode = useChessStore((s) => s.gameMode)
  const engineStrength = useChessStore((s) => s.engineStrength)
  const isAnalysisRunning = useAnalysisStore((s) => s.isRunning)

  const isEngineEnabled = useEngineStore((s) => s.isEngineEnabled)

  const boardFlipped = useChessStore((s) => s.boardFlipped)
  const turn = useChessStore((s) => s.turn)
  const gameStatus = useChessStore((s) => s.gameStatus)
  const currentMoveIndex = useChessStore((s) => s.currentMoveIndex)
  const moveHistoryLength = useChessStore((s) => s.moveHistory.length)

  const analysis = useEngineStore((s) => s.analysis)
  const isEngineLoaded = useEngineStore((s) => s.isEngineLoaded)
  const engineError = useEngineStore((s) => s.engineError)

  const depthRef = useRef(DEFAULT_ANALYSIS_DEPTH)
  const multiPVRef = useRef(DEFAULT_MULTIPV)

  // ─── Engine Initialization ──────────────────────────────────────────

  useEffect(() => {
    engine.onEngineReady(() => {
      setEngineLoaded(true)
      setEngineError(null)
    })

    engine.onEngineError((msg) => {
      setEngineError(msg)
    })

    engine.onAnalysisUpdate((analysis) => {
      setAnalysis(analysis)
    })

    engine.onBestMoveFound((move, fen) => {
      // In vs-engine mode, make the engine's move when it's the engine's turn
      const state = useChessStore.getState()
      if (state.gameMode !== 'vs-engine' || state.gameStatus !== 'playing') {
        return
      }

      // If reviewing past moves, do not execute
      if (state.currentMoveIndex !== state.moveHistory.length - 1) {
        return
      }

      const playerColor = state.boardFlipped ? 'b' : 'w'
      const engineColor = playerColor === 'w' ? 'b' : 'w'

      if (state.turn === engineColor && state.currentFen === fen) {
        const from = move.slice(0, 2)
        const to = move.slice(2, 4)
        const promotion = move.length > 4 ? move[4] : undefined

        // Small delay for natural human-like cadence
        setTimeout(() => {
          const latest = useChessStore.getState()
          if (
            latest.gameMode === 'vs-engine' &&
            latest.gameStatus === 'playing' &&
            latest.turn === engineColor &&
            latest.currentFen === fen &&
            latest.currentMoveIndex === latest.moveHistory.length - 1
          ) {
            latest.makeMove(from, to, promotion)
          }
        }, 250)
      }
    })

    engine.start()

    return () => {
      engine.terminate()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Analyze on FEN / Turn / Mode Change ──────────────────────────────

  useEffect(() => {
    if (!isEngineLoaded) return
    if (isAnalysisRunning || !isEngineEnabled) {
      engine.stopAnalysis()
      if (!isEngineEnabled) {
        clearAnalysis()
      }
      return
    }

    const state = useChessStore.getState()
    const isVsEngine = state.gameMode === 'vs-engine'
    const playerColor = state.boardFlipped ? 'b' : 'w'
    const engineColor = playerColor === 'w' ? 'b' : 'w'
    const isLatest = state.currentMoveIndex === state.moveHistory.length - 1
    const isEngineTurn = isVsEngine && state.turn === engineColor && state.gameStatus === 'playing' && isLatest

    clearAnalysis()

    if (isVsEngine) {
      if (isEngineTurn) {
        // Calibrate depth and movetime for engine response based on skill level
        let depth = 8
        let movetime = 800
        if (engineStrength <= 2) {
          depth = 4
          movetime = 400
        } else if (engineStrength <= 5) {
          depth = 6
          movetime = 600
        } else if (engineStrength <= 10) {
          depth = 9
          movetime = 900
        } else if (engineStrength <= 15) {
          depth = 12
          movetime = 1200
        } else {
          depth = 15
          movetime = 1500
        }

        engine.analyze(currentFen, {
          depth,
          multiPV: 1,
          skillLevel: engineStrength,
          movetime,
        })
      } else {
        // Player's turn: evaluate position for evaluation bar
        engine.analyze(currentFen, {
          depth: 10,
          multiPV: 1,
          skillLevel: engineStrength,
        })
      }
    } else {
      // Standard analysis board mode
      engine.analyze(currentFen, {
        depth: depthRef.current,
        multiPV: multiPVRef.current,
        skillLevel: 20,
      })
    }
  }, [
    currentFen,
    isEngineLoaded,
    isAnalysisRunning,
    isEngineEnabled,
    gameMode,
    engineStrength,
    boardFlipped,
    turn,
    gameStatus,
    currentMoveIndex,
    moveHistoryLength,
  ]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Public Controls ───────────────────────────────────────────────

  const setDepth = (depth: number) => {
    depthRef.current = depth
    engine.setDepth(depth)
    if (isEngineLoaded && isEngineEnabled) {
      engine.analyze(currentFen, { depth, multiPV: multiPVRef.current })
    }
  }

  const setMultiPV = (count: number) => {
    multiPVRef.current = count
    engine.setMultiPV(count)
  }

  const stopAnalysis = () => engine.stopAnalysis()

  const startAnalysis = () => {
    if (!isEngineEnabled) return
    engine.analyze(currentFen, {
      depth: depthRef.current,
      multiPV: multiPVRef.current,
    })
  }

  return {
    analysis,
    isEngineLoaded,
    engineError,
    depth: depthRef.current,
    multiPV: multiPVRef.current,
    setDepth,
    setMultiPV,
    stopAnalysis,
    startAnalysis,
  }
}
