/**
 * Evaluation utilities using the Lichess win-chance model.
 *
 * Win chance formula (same as Lichess / lila):
 *   winChance(cp) = 50 + 50 * tanh(cp / 600)
 *
 * This models the non-linear relationship between centipawn advantage
 * and actual winning probability (0–100 scale).
 */

/**
 * Convert centipawn evaluation to win percentage (0–100) from White's POV.
 * Mate positions are treated as 100 or 0.
 */
export function cpToWinChance(cp: number, mate: number | null): number {
  if (mate !== null) {
    return mate > 0 ? 100 : 0
  }
  // Clamp to avoid extreme values causing NaN
  const clamped = Math.max(-3000, Math.min(3000, cp))
  return 50 + 50 * Math.tanh(clamped / 600)
}

/**
 * Calculate win-chance loss for the player who made a move.
 *
 * Returns a value in [0, 100] representing how much win-chance
 * the player lost by playing their move versus the engine's best move.
 *
 * IMPORTANT: Evaluation must be from White's perspective.
 * - For White: higher eval = better, so loss = before - after
 * - For Black: lower eval = better, so loss = after - before (negated)
 */
export function calcWinChanceLoss(
  evalBefore: number | null,
  mateBefore: number | null,
  evalAfter: number | null,
  mateAfter: number | null,
  playerColor: 'w' | 'b'
): number {
  if (evalBefore === null || evalAfter === null) return 0

  const winBefore = cpToWinChance(evalBefore, mateBefore)
  const winAfter = cpToWinChance(evalAfter, mateAfter)

  if (playerColor === 'w') {
    // White wants higher win-chance
    return Math.max(0, winBefore - winAfter)
  } else {
    // Black wants lower win-chance (higher win-chance for White = bad for Black)
    return Math.max(0, winAfter - winBefore)
  }
}

/**
 * Normalize a centipawn value for the evaluation bar display.
 * Returns a value in [-1, +1] where:
 *   +1 = fully White
 *   -1 = fully Black
 *   0  = equal
 *
 * Uses tanh so extreme values don't dominate the visual.
 */
export function normalizeEvalForBar(cp: number, mate: number | null): number {
  if (mate !== null) {
    return mate > 0 ? 1 : -1
  }
  return Math.tanh(cp / 400)
}

/**
 * Calculate move-level accuracy using Chess.com CAPS2 style model.
 * Each move is scored between 0 and 100 based on its win chance loss,
 * heavily penalizing mistakes, missed wins, and blunders.
 */
export function calcMoveAccuracy(winChanceLoss: number): number {
  if (winChanceLoss <= 0.005) return 100
  // Normalized to percentage 0–100
  const lossPct = winChanceLoss > 1 ? winChanceLoss : winChanceLoss * 100
  if (lossPct <= 0.5) return 100

  // Sigmoidal exponential falloff calibrated to Chess.com CAPS2 curve
  const acc = 100 * Math.exp(-0.055 * lossPct)
  return Math.max(0, Math.min(100, acc))
}

/**
 * Calculate game accuracy for a player across all moves (Chess.com CAPS2 style).
 * Takes individual move win-chance losses, calculates per-move accuracy, and averages them.
 */
export function calcAccuracy(winChanceLosses: number[]): number {
  if (winChanceLosses.length === 0) return 100
  const moveAccuracies = winChanceLosses.map(calcMoveAccuracy)
  const avg = moveAccuracies.reduce((a, b) => a + b, 0) / moveAccuracies.length
  return Math.round(avg * 10) / 10
}

