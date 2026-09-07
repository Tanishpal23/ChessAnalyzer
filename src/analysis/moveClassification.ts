import type { MoveClassification } from '@/types/analysis'
import { CLASSIFICATION_THRESHOLDS } from '@/utils/constants'

/**
 * Classify a move using the Lichess win-chance loss model.
 *
 * @param winChanceLoss - Win-chance loss (0–100) for the player who made the move
 * @param isEngineTopChoice - Whether the played move matches the engine's top choice
 * @returns Lichess-style move classification
 */
export function classifyMove(
  winChanceLoss: number,
  isEngineTopChoice: boolean
): MoveClassification {
  if (isEngineTopChoice || winChanceLoss <= CLASSIFICATION_THRESHOLDS.best) {
    return 'best'
  }
  if (winChanceLoss <= CLASSIFICATION_THRESHOLDS.excellent) {
    return 'excellent'
  }
  if (winChanceLoss <= CLASSIFICATION_THRESHOLDS.good) {
    return 'good'
  }
  if (winChanceLoss <= CLASSIFICATION_THRESHOLDS.inaccuracy) {
    return 'inaccuracy'
  }
  if (winChanceLoss <= CLASSIFICATION_THRESHOLDS.mistake) {
    return 'mistake'
  }
  return 'blunder'
}

/** Classification display labels */
export const CLASSIFICATION_LABELS: Record<MoveClassification, string> = {
  best: 'Best',
  excellent: 'Excellent',
  good: 'Good',
  inaccuracy: 'Inaccuracy',
  mistake: 'Mistake',
  blunder: 'Blunder',
  book: 'Book',
}

/** Classification annotation symbols (like Lichess/Chess notation) */
export const CLASSIFICATION_SYMBOLS: Record<MoveClassification, string> = {
  best: '✓',
  excellent: '!',
  good: '',
  inaccuracy: '?!',
  mistake: '?',
  blunder: '??',
  book: '',
}
