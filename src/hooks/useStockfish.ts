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
  const makeMove = useChessStore((s) => s.makeMove)
  const isAnalysisRunning = useAnalysisStore((s) => s.isRunning)

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
      if (gameMode === 'vs-engine') {
        const currentFen = useChessStore.getState().currentFen
        if (currentFen === fen) {
          const from = move.slice(0, 2)
          const to = move.slice(2, 4)
          const promotion = move.length > 4 ? move[4] : undefined
          // Small delay for UX — feels more natural than instant move
          setTimeout(() => {
            makeMove(from, to, promotion)
          }, 300)
        }
      }
    })

    engine.start()

    return () => {
      engine.terminate()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Analyze on FEN Change ─────────────────────────────────────────

  useEffect(() => {
    if (!isEngineLoaded) return
    if (isAnalysisRunning) {
      engine.stopAnalysis()
      return
    }
    clearAnalysis()
    engine.analyze(currentFen, {
      depth: depthRef.current,
      multiPV: multiPVRef.current,
      skillLevel: gameMode === 'vs-engine' ? engineStrength : 20,
    })
  }, [currentFen, isEngineLoaded, isAnalysisRunning, gameMode, engineStrength]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Public Controls ───────────────────────────────────────────────

  const setDepth = (depth: number) => {
    depthRef.current = depth
    engine.setDepth(depth)
    if (isEngineLoaded) {
      engine.analyze(currentFen, { depth, multiPV: multiPVRef.current })
    }
  }

  const setMultiPV = (count: number) => {
    multiPVRef.current = count
    engine.setMultiPV(count)
  }

  const stopAnalysis = () => engine.stopAnalysis()

  const startAnalysis = () => {
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
