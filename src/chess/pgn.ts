import { Chess } from 'chess.js'

/** Parse and validate a PGN string. Returns null if invalid. */
export function parsePgn(pgn: string): Chess | null {
  try {
    const chess = new Chess()
    chess.loadPgn(pgn)
    return chess
  } catch {
    return null
  }
}

/**
 * Convert a UCI move string (e.g. "g1f3") to SAN (e.g. "Nf3")
 * given a chess.js instance in the correct position.
 */
export function uciToSan(chess: Chess, uciMove: string): string {
  if (!uciMove || uciMove.length < 4) return uciMove

  const from = uciMove.slice(0, 2)
  const to = uciMove.slice(2, 4)
  const promotion = uciMove.length > 4 ? uciMove[4] : undefined

  try {
    // chess.js move() mutates — use a clone
    const clone = new Chess(chess.fen())
    const result = clone.move({ from, to, promotion })
    return result?.san ?? uciMove
  } catch {
    return uciMove
  }
}

/**
 * Convert an array of UCI moves (a principal variation) starting from a given FEN
 * into an array of SAN strings.
 */
export function pvToSan(startFen: string, pvUci: string[]): string[] {
  const chess = new Chess(startFen)
  const sanMoves: string[] = []

  for (const uci of pvUci) {
    if (uci.length < 4) break
    const from = uci.slice(0, 2)
    const to = uci.slice(2, 4)
    const promotion = uci.length > 4 ? uci[4] : undefined
    try {
      const result = chess.move({ from, to, promotion })
      if (!result) break
      sanMoves.push(result.san)
    } catch {
      break
    }
  }

  return sanMoves
}

/** Format a PGN header tag */
export function buildPgnHeader(tags: Record<string, string>): string {
  return Object.entries(tags)
    .map(([key, val]) => `[${key} "${val}"]`)
    .join('\n')
}
