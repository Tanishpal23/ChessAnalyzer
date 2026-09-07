import type { UCIInfo, UCIBestMove } from '@/types/engine'

/**
 * Parse a single UCI output line from Stockfish.
 *
 * Examples:
 *   "info depth 18 seldepth 24 multipv 1 score cp 72 nodes 1234567 nps 890000 pv e2e4 e7e5"
 *   "info depth 5 score mate 3 pv e1g1"
 *   "bestmove e2e4 ponder e7e5"
 *   "readyok"
 *   "uciok"
 */
export function parseUCILine(line: string): {
  type: 'info' | 'bestmove' | 'readyok' | 'uciok' | 'unknown'
  info?: UCIInfo
  bestmove?: UCIBestMove
} {
  const trimmed = line.trim()

  if (trimmed === 'readyok') return { type: 'readyok' }
  if (trimmed === 'uciok') return { type: 'uciok' }

  if (trimmed.startsWith('bestmove')) {
    return { type: 'bestmove', bestmove: parseBestMove(trimmed) }
  }

  if (trimmed.startsWith('info')) {
    return { type: 'info', info: parseInfo(trimmed) }
  }

  return { type: 'unknown' }
}

// ─── Internal Parsers ──────────────────────────────────────────────────────

function parseBestMove(line: string): UCIBestMove {
  // "bestmove e2e4 ponder e7e5"
  const parts = line.split(/\s+/)
  return {
    move: parts[1] ?? '',
    ponder: parts[3], // parts[2] is "ponder"
  }
}

function parseInfo(line: string): UCIInfo {
  const tokens = line.split(/\s+/)
  const info: UCIInfo = {}
  let i = 1 // skip "info"

  while (i < tokens.length) {
    const token = tokens[i]

    switch (token) {
      case 'depth':
        info.depth = parseInt(tokens[++i], 10)
        break
      case 'seldepth':
        info.seldepth = parseInt(tokens[++i], 10)
        break
      case 'multipv':
        info.multipv = parseInt(tokens[++i], 10)
        break
      case 'nodes':
        info.nodes = parseInt(tokens[++i], 10)
        break
      case 'nps':
        info.nps = parseInt(tokens[++i], 10)
        break
      case 'time':
        info.time = parseInt(tokens[++i], 10)
        break
      case 'hashfull':
        info.hashfull = parseInt(tokens[++i], 10)
        break
      case 'score': {
        const scoreType = tokens[++i] // "cp" or "mate"
        const scoreValue = parseInt(tokens[++i], 10)
        if (scoreType === 'cp') {
          info.score = { type: 'cp', value: scoreValue }
        } else if (scoreType === 'mate') {
          info.score = { type: 'mate', value: scoreValue }
        }
        break
      }
      case 'pv': {
        // Everything from here to end of line is the PV
        info.pv = tokens.slice(i + 1)
        i = tokens.length // consume rest
        break
      }
      default:
        break
    }

    i++
  }

  return info
}
