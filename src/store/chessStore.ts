import { create } from 'zustand'
import { ChessGame } from '@/chess/ChessGame'
import type { ChessState, Color } from '@/types/chess'
import { STARTING_FEN } from '@/utils/constants'

interface ChessStore extends ChessState {
  // Actions
  makeMove: (from: string, to: string, promotion?: string) => boolean
  goToMove: (index: number) => void
  goToFirst: () => void
  goToPrev: () => void
  goToNext: () => void
  goToLast: () => void
  resetGame: () => void
  flipBoard: () => void
  loadFen: (fen: string) => { success: boolean; error?: string }
  loadPgn: (pgn: string) => { success: boolean; error?: string }
  exportPgn: () => string
  setGameMode: (mode: 'local' | 'vs-engine') => void
  setEngineStrength: (level: number) => void
  getLegalMoves: (square: string) => string[]
}

// Internal game instance — not part of zustand state (mutable)
let game = new ChessGame()

export const useChessStore = create<ChessStore>((set, get) => ({
  // ─── Initial State ───────────────────────────────────────────────────
  currentFen: STARTING_FEN,
  moveHistory: [],
  currentMoveIndex: -1,
  turn: 'w',
  gameStatus: 'playing',
  winner: null,
  boardFlipped: false,
  gameMode: 'local',
  engineStrength: 10,

  // ─── Actions ─────────────────────────────────────────────────────────

  makeMove: (from, to, promotion) => {
    const state = get()
    const { currentMoveIndex, moveHistory } = state

    // If we're reviewing a past move, truncate history at current point
    if (currentMoveIndex < moveHistory.length - 1) {
      game.truncateAt(currentMoveIndex)
    }

    const result = game.makeMove({ from, to, promotion })
    if (!result) return false

    const newHistory = game.history
    const newIndex = newHistory.length - 1

    let gameStatus: ChessState['gameStatus'] = 'playing'
    let winner: Color | null = null

    if (game.isCheckmate) {
      gameStatus = 'checkmate'
      winner = result.color // whoever just moved wins
    } else if (game.isStalemate) {
      gameStatus = 'stalemate'
    } else if (game.isDraw) {
      gameStatus = 'draw'
    }

    set({
      currentFen: game.fen,
      moveHistory: [...newHistory],
      currentMoveIndex: newIndex,
      turn: game.turn,
      gameStatus,
      winner,
    })

    return true
  },

  goToMove: (index) => {
    const { moveHistory } = get()
    const clampedIndex = Math.max(-1, Math.min(moveHistory.length - 1, index))
    const fen = game.fenAt(clampedIndex)

    set({
      currentFen: fen,
      currentMoveIndex: clampedIndex,
      turn: fen.includes(' b ') ? 'b' : 'w',
    })
  },

  goToFirst: () => get().goToMove(-1),
  goToPrev: () => get().goToMove(get().currentMoveIndex - 1),
  goToNext: () => get().goToMove(get().currentMoveIndex + 1),
  goToLast: () => get().goToMove(get().moveHistory.length - 1),

  resetGame: () => {
    game = new ChessGame()
    set({
      currentFen: STARTING_FEN,
      moveHistory: [],
      currentMoveIndex: -1,
      turn: 'w',
      gameStatus: 'playing',
      winner: null,
    })
  },

  flipBoard: () => set((s) => ({ boardFlipped: !s.boardFlipped })),

  loadFen: (fen) => {
    const newGame = new ChessGame()
    const success = newGame.loadFen(fen)
    if (!success) {
      return { success: false, error: 'Invalid FEN string' }
    }
    game = newGame
    set({
      currentFen: newGame.fen,
      moveHistory: [],
      currentMoveIndex: -1,
      turn: newGame.turn,
      gameStatus: 'playing',
      winner: null,
    })
    return { success: true }
  },

  loadPgn: (pgn) => {
    const newGame = new ChessGame()
    const success = newGame.loadPgn(pgn)
    if (!success) {
      return { success: false, error: 'Invalid PGN string' }
    }
    game = newGame
    const history = newGame.history
    const lastIndex = history.length - 1
    const currentFen = lastIndex >= 0 ? history[lastIndex].fen : STARTING_FEN

    let gameStatus: ChessState['gameStatus'] = 'playing'
    let winner: Color | null = null
    if (newGame.isCheckmate) {
      gameStatus = 'checkmate'
      winner = history[lastIndex]?.color ?? null
    } else if (newGame.isStalemate) {
      gameStatus = 'stalemate'
    } else if (newGame.isDraw) {
      gameStatus = 'draw'
    }

    set({
      currentFen,
      moveHistory: [...history],
      currentMoveIndex: lastIndex,
      turn: newGame.turn,
      gameStatus,
      winner,
    })
    return { success: true }
  },

  exportPgn: () => game.toPgn(),

  setGameMode: (mode) => set({ gameMode: mode }),
  setEngineStrength: (level) => set({ engineStrength: level }),
  getLegalMoves: (square: string) => game.legalMovesFrom(square),
}))
