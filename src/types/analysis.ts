import type { Color } from './chess'

// ─── Analysis Types ────────────────────────────────────────────────────────

/**
 * Lichess-style move classification.
 * Thresholds are based on win-chance loss (not raw centipawns).
 */
export type MoveClassification =
  | 'best'
  | 'excellent'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder'
  | 'book' // opening book move (future)

/** Analysis data for a single move in the game */
export interface AnalyzedMove {
  moveNumber: number
  color: Color
  /** SAN of the move played */
  san: string
  /** UCI of the move played */
  uci: string
  /** FEN before this move */
  fenBefore: string
  /** FEN after this move */
  fenAfter: string
  /** Best move UCI Stockfish found for the position before */
  bestMoveUci: string | null
  /** Best move SAN Stockfish found */
  bestMoveSan: string | null
  /** Engine evaluation (cp from White's POV) before this move */
  evaluationBefore: number | null
  /** Engine evaluation (cp from White's POV) after this move */
  evaluationAfter: number | null
  /** Win-chance loss (0–1) for the player who made this move */
  winChanceLoss: number
  /** Lichess-style classification */
  classification: MoveClassification
}

/** Per-player summary statistics */
export interface PlayerSummary {
  accuracy: number // 0–100
  bestMoves: number
  excellentMoves: number
  goodMoves: number
  inaccuracies: number
  mistakes: number
  blunders: number
}

/** Complete game analysis result */
export interface GameAnalysis {
  analyzedMoves: AnalyzedMove[]
  white: PlayerSummary
  black: PlayerSummary
  /** Evaluation at each half-move index (for the graph) */
  evaluationHistory: Array<number | null>
  isComplete: boolean
  /** 0–1 progress (for loading indicator) */
  progress: number
}
