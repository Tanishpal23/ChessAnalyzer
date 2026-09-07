import { Chess, type Square } from 'chess.js'
import type { HistoryMove, Color } from '@/types/chess'
import { STARTING_FEN } from '@/utils/constants'

/**
 * Thin wrapper around chess.js that tracks full move history
 * including FEN snapshots before and after each move.
 *
 * All chess rule enforcement is delegated to chess.js.
 */
export class ChessGame {
  private chess: Chess
  private _history: HistoryMove[] = []

  constructor(fen: string = STARTING_FEN) {
    this.chess = new Chess(fen)
  }

  // ─── State Accessors ──────────────────────────────────────────────────

  get fen(): string {
    return this.chess.fen()
  }

  get turn(): Color {
    return this.chess.turn() as Color
  }

  get isGameOver(): boolean {
    return this.chess.isGameOver()
  }

  get isCheckmate(): boolean {
    return this.chess.isCheckmate()
  }

  get isStalemate(): boolean {
    return this.chess.isStalemate()
  }

  get isDraw(): boolean {
    return this.chess.isDraw()
  }

  get isInCheck(): boolean {
    return this.chess.isCheck()
  }

  get history(): HistoryMove[] {
    return this._history
  }

  // ─── Move Operations ──────────────────────────────────────────────────

  /**
   * Attempt to make a move. Returns the HistoryMove on success, null on failure.
   * Accepts either SAN ("Nf3") or UCI ("g1f3") or from/to object.
   */
  makeMove(
    move: string | { from: string; to: string; promotion?: string }
  ): HistoryMove | null {
    const fenBefore = this.chess.fen()
    const moveNumber = Math.ceil((this._history.length + 1) / 2)
    const color = this.chess.turn() as Color

    try {
      const result = this.chess.move(move)
      if (!result) return null

      const historyMove: HistoryMove = {
        san: result.san,
        uci: result.from + result.to + (result.promotion ?? ''),
        fen: this.chess.fen(),
        fenBefore,
        moveNumber,
        color,
      }

      this._history.push(historyMove)
      return historyMove
    } catch {
      return null
    }
  }

  /**
   * Truncate history after a given index and restore that position.
   * Used when user makes a move while reviewing older position.
   */
  truncateAt(index: number): void {
    this._history = this._history.slice(0, index + 1)
    const targetFen = index < 0 ? STARTING_FEN : this._history[index].fen
    this.chess = new Chess(targetFen)
  }

  /** Get the FEN at a specific history index (-1 = start) */
  fenAt(index: number): string {
    if (index < 0) return STARTING_FEN
    return this._history[index]?.fen ?? STARTING_FEN
  }

  /** Reset to a fresh game */
  reset(): void {
    this.chess = new Chess()
    this._history = []
  }

  /**
   * Load a position from FEN.
   * Returns true on success, false if the FEN is invalid.
   */
  loadFen(fen: string): boolean {
    try {
      this.chess = new Chess(fen)
      this._history = []
      return true
    } catch {
      return false
    }
  }

  /**
   * Load a game from PGN.
   * Returns true on success, false if the PGN is invalid.
   */
  loadPgn(pgn: string): boolean {
    try {
      const tempChess = new Chess()
      tempChess.loadPgn(pgn)

      // Replay moves to build history with FEN snapshots
      const moves = tempChess.history({ verbose: true })
      this.chess = new Chess()
      this._history = []

      for (const m of moves) {
        const fenBefore = this.chess.fen()
        const color = this.chess.turn() as Color
        const moveNumber = Math.ceil((this._history.length + 1) / 2)
        this.chess.move(m)
        this._history.push({
          san: m.san,
          uci: m.from + m.to + (m.promotion ?? ''),
          fen: this.chess.fen(),
          fenBefore,
          moveNumber,
          color,
        })
      }
      return true
    } catch {
      return false
    }
  }

  /** Export the current game as PGN */
  toPgn(): string {
    // Replay history on a fresh board to build PGN
    const temp = new Chess()
    for (const m of this._history) {
      temp.move(m.san)
    }
    return temp.pgn()
  }

  /** Get legal moves for a square (for highlighting) */
  legalMovesFrom(square: string): string[] {
    try {
      const moves = this.chess.moves({ square: square as Square, verbose: true })
      return moves.map((m) => (typeof m === 'object' ? m.to : ''))
    } catch {
      return []
    }
  }

  /** Check if a given FEN string is valid */
  static validateFen(fen: string): { valid: boolean; error?: string } {
    try {
      new Chess(fen)
      return { valid: true }
    } catch (e) {
      return { valid: false, error: e instanceof Error ? e.message : 'Invalid FEN' }
    }
  }
}
