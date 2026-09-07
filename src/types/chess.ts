// ─── Chess Domain Types ────────────────────────────────────────────────────

export type Color = 'w' | 'b'
export type PieceSymbol = 'p' | 'n' | 'b' | 'r' | 'q' | 'k'
export type Square = string // e.g. "e4"

export interface Piece {
  type: PieceSymbol
  color: Color
}

export type GameStatus = 'playing' | 'checkmate' | 'stalemate' | 'draw' | 'resigned'

export interface HistoryMove {
  /** Standard Algebraic Notation, e.g. "Nf3" */
  san: string
  /** UCI notation, e.g. "g1f3" */
  uci: string
  /** FEN *after* this move was played */
  fen: string
  /** FEN *before* this move was played */
  fenBefore: string
  /** Move number (1-based) */
  moveNumber: number
  /** Which color played this move */
  color: Color
}

export interface ChessState {
  /** FEN of the currently viewed position */
  currentFen: string
  /** Full move history of the game */
  moveHistory: HistoryMove[]
  /**
   * Index into moveHistory representing the currently viewed move.
   * -1 = starting position (before any moves)
   */
  currentMoveIndex: number
  /** Whose turn it is in the *current* position */
  turn: Color
  gameStatus: GameStatus
  /** Winner color, or null if not decided */
  winner: Color | null
  /** Whether the board is displayed from Black's perspective */
  boardFlipped: boolean
  /** Game mode */
  gameMode: 'local' | 'vs-engine'
  /** Strength level when playing vs engine (1-20) */
  engineStrength: number
}
