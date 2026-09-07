/**
 * Convert a UCI move string to from/to squares and optional promotion.
 * e.g. "e2e4" → { from: "e2", to: "e4" }
 * e.g. "e7e8q" → { from: "e7", to: "e8", promotion: "q" }
 */
export function parseUciMove(uci: string): {
  from: string
  to: string
  promotion?: string
} | null {
  if (!uci || uci.length < 4) return null
  return {
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci.length > 4 ? uci[4] : undefined,
  }
}

/**
 * Get the board coordinates for an arrow from UCI move,
 * accounting for board flip.
 */
export function getArrowSquares(
  uci: string,
  flipped: boolean
): { from: string; to: string } | null {
  const parsed = parseUciMove(uci)
  if (!parsed) return null

  if (flipped) {
    return {
      from: flipSquare(parsed.from),
      to: flipSquare(parsed.to),
    }
  }

  return { from: parsed.from, to: parsed.to }
}

/** Flip a square for board orientation (e.g. "e2" → "d7") */
function flipSquare(square: string): string {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0)
  const rank = parseInt(square[1], 10) - 1
  const flippedFile = 7 - file
  const flippedRank = 7 - rank
  return String.fromCharCode('a'.charCodeAt(0) + flippedFile) + (flippedRank + 1)
}

/** Convert centipawn evaluation to a display string, e.g. "+1.42" or "-0.30" */
export function formatEval(cp: number | null, mate: number | null): string {
  if (mate !== null) {
    if (mate === 0) return '#'
    return mate > 0 ? `#${mate}` : `#${mate}`
  }
  if (cp === null) return '...'
  const pawns = cp / 100
  return pawns >= 0 ? `+${pawns.toFixed(2)}` : pawns.toFixed(2)
}

/** Format nodes count for display (e.g. 1500000 → "1.5M") */
export function formatNodes(nodes: number): string {
  if (nodes >= 1_000_000) return `${(nodes / 1_000_000).toFixed(1)}M`
  if (nodes >= 1_000) return `${(nodes / 1_000).toFixed(0)}k`
  return `${nodes}`
}

/** Format NPS for display */
export function formatNps(nps: number): string {
  if (nps >= 1_000_000) return `${(nps / 1_000_000).toFixed(1)}M/s`
  if (nps >= 1_000) return `${(nps / 1_000).toFixed(0)}k/s`
  return `${nps}/s`
}
