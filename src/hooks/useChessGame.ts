import { useCallback } from 'react'
import { useChessStore } from '@/store/chessStore'

/**
 * useChessGame — primary hook for chess gameplay.
 *
 * Provides a stable API over the chess store, preventing unnecessary
 * re-renders via selective subscriptions.
 */
export function useChessGame() {
  const makeMove = useChessStore((s) => s.makeMove)
  const goToMove = useChessStore((s) => s.goToMove)
  const goToFirst = useChessStore((s) => s.goToFirst)
  const goToPrev = useChessStore((s) => s.goToPrev)
  const goToNext = useChessStore((s) => s.goToNext)
  const goToLast = useChessStore((s) => s.goToLast)
  const resetGame = useChessStore((s) => s.resetGame)
  const flipBoard = useChessStore((s) => s.flipBoard)
  const loadFen = useChessStore((s) => s.loadFen)
  const loadPgn = useChessStore((s) => s.loadPgn)
  const exportPgn = useChessStore((s) => s.exportPgn)

  const currentFen = useChessStore((s) => s.currentFen)
  const moveHistory = useChessStore((s) => s.moveHistory)
  const currentMoveIndex = useChessStore((s) => s.currentMoveIndex)
  const turn = useChessStore((s) => s.turn)
  const gameStatus = useChessStore((s) => s.gameStatus)
  const winner = useChessStore((s) => s.winner)
  const boardFlipped = useChessStore((s) => s.boardFlipped)
  const gameMode = useChessStore((s) => s.gameMode)

  const handleMove = useCallback(
    (from: string, to: string, promotion?: string) => makeMove(from, to, promotion),
    [makeMove]
  )

  return {
    // State
    currentFen,
    moveHistory,
    currentMoveIndex,
    turn,
    gameStatus,
    winner,
    boardFlipped,
    gameMode,

    // Derived
    isAtStart: currentMoveIndex === -1,
    isAtEnd: currentMoveIndex === moveHistory.length - 1,
    canGoBack: currentMoveIndex > -1,
    canGoForward: currentMoveIndex < moveHistory.length - 1,

    // Actions
    makeMove: handleMove,
    goToMove,
    goToFirst,
    goToPrev,
    goToNext,
    goToLast,
    resetGame,
    flipBoard,
    loadFen,
    loadPgn,
    exportPgn,
  }
}
