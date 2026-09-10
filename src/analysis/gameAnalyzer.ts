import type { AnalyzedMove, GameAnalysis, PlayerSummary } from '@/types/analysis'
import type { HistoryMove } from '@/types/chess'
import { calcWinChanceLoss, calcAccuracy } from './evaluation'
import { classifyMove } from './moveClassification'
import { identifyOpening, isOpeningBookMove } from './openingBook'

/**
 * Build a GameAnalysis from per-move engine evaluations.
 *
 * Computes win-chance losses, classifies moves with Chess.com logic,
 * detects opening book theory, and calculates CAPS2 accuracy.
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

  // Check opening theory line
  const opening = identifyOpening(moveHistory)

  for (let i = 0; i < moveHistory.length; i++) {
    const move = moveHistory[i]
    const evalBefore = evaluations[i] ?? null
    const evalAfter = evaluations[i + 1] ?? null
    const bestMoveUci = bestMoves[i] ?? null
    const bestMoveSan = bestMovesSan[i] ?? null

    const winChanceLoss = calcWinChanceLoss(evalBefore, null, evalAfter, null, move.color)
    const isEngineTopChoice = bestMoveUci !== null && move.uci === bestMoveUci
    const isBook = isOpeningBookMove(moveHistory, i)

    const classification = classifyMove({
      winChanceLoss,
      isEngineTopChoice,
      evalBefore,
      evalAfter,
      playerColor: move.color,
      fenBefore: move.fenBefore,
      fenAfter: move.fen,
      san: move.san,
      uci: move.uci,
      isBook,
    })

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
    openingName: opening?.name,
    eco: opening?.eco,
  }
}

function buildPlayerSummary(moves: AnalyzedMove[], losses: number[]): PlayerSummary {
  return {
    accuracy: Math.round(calcAccuracy(losses) * 10) / 10,
    brilliant: moves.filter((m) => m.classification === 'brilliant').length,
    greatMoves: moves.filter((m) => m.classification === 'great').length,
    bestMoves: moves.filter((m) => m.classification === 'best').length,
    excellentMoves: moves.filter((m) => m.classification === 'excellent').length,
    goodMoves: moves.filter((m) => m.classification === 'good').length,
    bookMoves: moves.filter((m) => m.classification === 'book').length,
    inaccuracies: moves.filter((m) => m.classification === 'inaccuracy').length,
    mistakes: moves.filter((m) => m.classification === 'mistake').length,
    missedWins: moves.filter((m) => m.classification === 'missed_win').length,
    blunders: moves.filter((m) => m.classification === 'blunder').length,
  }
}
