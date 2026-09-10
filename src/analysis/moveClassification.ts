import type { MoveClassification } from '@/types/analysis'
import { CLASSIFICATION_THRESHOLDS } from '@/utils/constants'

export interface ClassifyMoveParams {
  winChanceLoss: number
  isEngineTopChoice: boolean
  evalBefore?: number | null
  evalAfter?: number | null
  mateBefore?: number | null
  mateAfter?: number | null
  playerColor?: 'w' | 'b'
  fenBefore?: string
  fenAfter?: string
  san?: string
  uci?: string
  isBook?: boolean
}

/** Material piece values for sacrifice detection */
const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
}

function calculateMaterial(fen: string): { white: number; black: number } {
  const boardPart = fen.split(' ')[0]
  let white = 0
  let black = 0
  for (const char of boardPart) {
    const lower = char.toLowerCase()
    if (PIECE_VALUES[lower] !== undefined) {
      if (char >= 'A' && char <= 'Z') {
        white += PIECE_VALUES[lower]
      } else {
        black += PIECE_VALUES[lower]
      }
    }
  }
  return { white, black }
}

/**
 * Classify a chess move using Chess.com-style categories:
 * - Brilliant (!!)
 * - Great (!)
 * - Best (✓)
 * - Excellent (!)
 * - Good
 * - Book (📖)
 * - Inaccuracy (?!)
 * - Mistake (?)
 * - Missed Win (❌)
 * - Blunder (??)
 */
export function classifyMove(
  paramsOrLoss: number | ClassifyMoveParams,
  legacyIsEngineTopChoice?: boolean
): MoveClassification {
  // Support legacy signature: classifyMove(winChanceLoss, isEngineTopChoice)
  const params: ClassifyMoveParams =
    typeof paramsOrLoss === 'number'
      ? {
          winChanceLoss: paramsOrLoss,
          isEngineTopChoice: !!legacyIsEngineTopChoice,
        }
      : paramsOrLoss

  const {
    winChanceLoss,
    isEngineTopChoice,
    evalBefore = null,
    evalAfter = null,
    mateBefore = null,
    mateAfter = null,
    playerColor = 'w',
    fenBefore,
    fenAfter,
    isBook = false,
  } = params

  // Normalize win-chance loss to a 0–100 percentage scale
  const lossPct = winChanceLoss <= 1 && winChanceLoss > 0 ? winChanceLoss * 100 : winChanceLoss

  // 1. Book Move (Opening Theory): Allow up to 15% win-chance loss for established sidelines
  if (isBook && lossPct <= 15) {
    return 'book'
  }

  // Determine winning states from player's POV
  const isPlayerWhite = playerColor === 'w'
  const isWinningBefore =
    isPlayerWhite
      ? (evalBefore !== null && evalBefore >= 250) || (mateBefore !== null && mateBefore > 0)
      : (evalBefore !== null && evalBefore <= -250) || (mateBefore !== null && mateBefore < 0)

  const isWinningAfter =
    isPlayerWhite
      ? (evalAfter !== null && evalAfter >= 150) || (mateAfter !== null && mateAfter > 0)
      : (evalAfter !== null && evalAfter <= -150) || (mateAfter !== null && mateAfter < 0)

  // 2. Missed Win: Player was winning before, but played a move that threw away the win
  if (isWinningBefore) {
    const lostAdvantage =
      isPlayerWhite
        ? (evalAfter !== null && evalAfter < 100) || (mateAfter !== null && mateAfter <= 0)
        : (evalAfter !== null && evalAfter > -100) || (mateAfter !== null && mateAfter >= 0)

    if (lostAdvantage || lossPct >= 25) {
      return 'missed_win'
    }
  }

  // 3. Brilliant Move (!!): Top engine move with a genuine piece sacrifice
  // that maintains or leads to a winning position
  if ((isEngineTopChoice || lossPct <= 1.5) && fenBefore && fenAfter && isWinningAfter) {
    const matBefore = calculateMaterial(fenBefore)
    const matAfter = calculateMaterial(fenAfter)

    const playerGain = isPlayerWhite
      ? matAfter.white - matBefore.white - (matAfter.black - matBefore.black)
      : matAfter.black - matBefore.black - (matAfter.white - matBefore.white)

    // Player gave up 2+ points of material (e.g. minor piece, rook for minor, or queen)
    if (playerGain <= -2) {
      return 'brilliant'
    }
  }

  // 4. Great Move (!): Critical game-swinging or lone saving tactic
  if (isEngineTopChoice || lossPct <= 1.5) {
    if (evalBefore !== null && evalAfter !== null) {
      const swing = isPlayerWhite ? evalAfter - evalBefore : evalBefore - evalAfter
      // Finding a move that improves the player's position by 150+ cp when not already crushing
      if (swing >= 150 && (!isWinningBefore || Math.abs(evalBefore) <= 200)) {
        return 'great'
      }
    }
  }

  // 5. Best Move
  if (isEngineTopChoice || lossPct <= CLASSIFICATION_THRESHOLDS.best) {
    return 'best'
  }

  // 6. Excellent Move
  if (lossPct <= CLASSIFICATION_THRESHOLDS.excellent) {
    return 'excellent'
  }

  // 7. Good Move
  if (lossPct <= CLASSIFICATION_THRESHOLDS.good) {
    return 'good'
  }

  // 8. Inaccuracy
  if (lossPct <= CLASSIFICATION_THRESHOLDS.inaccuracy) {
    return 'inaccuracy'
  }

  // 9. Mistake
  if (lossPct <= CLASSIFICATION_THRESHOLDS.mistake) {
    return 'mistake'
  }

  // 10. Blunder
  return 'blunder'
}

/** Classification display labels (Chess.com style) */
export const CLASSIFICATION_LABELS: Record<MoveClassification, string> = {
  brilliant: 'Brilliant',
  great: 'Great',
  best: 'Best',
  excellent: 'Excellent',
  good: 'Good',
  book: 'Book',
  inaccuracy: 'Inaccuracy',
  mistake: 'Mistake',
  missed_win: 'Missed Win',
  blunder: 'Blunder',
}

/** Classification annotation symbols (Chess.com style) */
export const CLASSIFICATION_SYMBOLS: Record<MoveClassification, string> = {
  brilliant: '!!',
  great: '!',
  best: '✓',
  excellent: '!',
  good: '✓',
  book: '📖',
  inaccuracy: '?!',
  mistake: '?',
  missed_win: '❌',
  blunder: '??',
}
