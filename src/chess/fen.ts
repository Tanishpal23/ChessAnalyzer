import { Chess } from 'chess.js'

/** Validate a FEN string and return a descriptive error if invalid */
export function validateFen(fen: string): { valid: boolean; error?: string } {
  if (!fen || typeof fen !== 'string') {
    return { valid: false, error: 'FEN must be a non-empty string' }
  }
  try {
    new Chess(fen)
    return { valid: true }
  } catch (e) {
    return { valid: false, error: e instanceof Error ? e.message : 'Invalid FEN' }
  }
}

/** Extract the active color from a FEN string */
export function fenTurn(fen: string): 'w' | 'b' {
  const parts = fen.split(' ')
  const color = parts[1]
  return color === 'b' ? 'b' : 'w'
}

/** Extract the full-move number from a FEN string */
export function fenMoveNumber(fen: string): number {
  const parts = fen.split(' ')
  return parseInt(parts[5] ?? '1', 10)
}
