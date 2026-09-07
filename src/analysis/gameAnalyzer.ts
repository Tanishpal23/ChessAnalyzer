import type { AnalyzedMove, GameAnalysis, PlayerSummary } from '@/types/analysis'
import type { HistoryMove } from '@/types/chess'
import { calcWinChanceLoss, calcAccuracy } from './evaluation'
import { classifyMove } from './moveClassification'

/**
 * Build a GameAnalysis from per-move engine evaluations.
 *
 * This is called after all moves have been analyzed by Stockfish.
 * It computes win-chance losses, classifies moves, and calculates accuracy.
 *
 * @param moveHistory - The game's move history
 * @param evaluations - Engine evaluation (cp from White's POV) for each position.
 *   evaluations[i] = eval of position AFTER moveHistory[i].
 *   evaluations[-1] (i.e. index 0 of this array = position before move 0) is the starting eval.
 * @param bestMoves - Best move UCI at each position before each move
 */
export function buildGameAnalysis(
  moveHistory: HistoryMove[],
  /** evaluations[0] = eval at start, evaluations[i+1] = eval after move i */
  evaluations: Array<number | null>,
  bestMoves: Array<string | null>,
  bestMovesSan: Array<string | null>
): GameAnalysis {
  const analyzedMoves: AnalyzedMove[] = []
  const whiteLosses: number[] = []
  const blackLosses: number[] = []

  for (let i = 0; i < moveHistory.length; i++) {
    const move = moveHistory[i]
    const evalBefore = evaluations[i] ?? null
    const evalAfter = evaluations[i + 1] ?? null
    const bestMoveUci = bestMoves[i] ?? null
    const bestMoveSan = bestMovesSan[i] ?? null

    const winChanceLoss = calcWinChanceLoss(evalBefore, null, evalAfter, null, move.color)
    const isEngineTopChoice = bestMoveUci !== null && move.uci === bestMoveUci
    const classification = classifyMove(winChanceLoss, isEngineTopChoice)

    analyzedMoves.push({
      moveNumber: move.moveNumber,
      color: move.color,
      san: move.san,
      uci: move.uci,
      fenBefore: move.fenBefore,
      fenAfter: move.fen,
      bestMoveUci,
      bestMoveSan,
      evaluationBefore: evalBefore,
      evaluationAfter: evalAfter,
      winChanceLoss,
      classification,
    })

    if (move.color === 'w') {
      whiteLosses.push(winChanceLoss)
    } else {
      blackLosses.push(winChanceLoss)
    }
  }

  const white = buildPlayerSummary(
    analyzedMoves.filter((m) => m.color === 'w'),
    whiteLosses
  )
  const black = buildPlayerSummary(
    analyzedMoves.filter((m) => m.color === 'b'),
    blackLosses
  )

  return {
    analyzedMoves,
    white,
    black,
    evaluationHistory: evaluations,
    isComplete: true,
    progress: 1,
  }
}

function buildPlayerSummary(moves: AnalyzedMove[], losses: number[]): PlayerSummary {
  return {
    accuracy: Math.round(calcAccuracy(losses) * 10) / 10,
    bestMoves: moves.filter((m) => m.classification === 'best').length,
    excellentMoves: moves.filter((m) => m.classification === 'excellent').length,
    goodMoves: moves.filter((m) => m.classification === 'good').length,
    inaccuracies: moves.filter((m) => m.classification === 'inaccuracy').length,
    mistakes: moves.filter((m) => m.classification === 'mistake').length,
    blunders: moves.filter((m) => m.classification === 'blunder').length,
  }
}
