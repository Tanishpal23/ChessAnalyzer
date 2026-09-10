import { describe, it, expect } from 'vitest'
import { buildGameAnalysis } from '@/analysis/gameAnalyzer'
import type { HistoryMove } from '@/types/chess'

describe('gameAnalyzer', () => {
  it('analyzes a short game, identifies opening, and computes accuracy', () => {
    const moves: HistoryMove[] = [
      {
        san: 'e4',
        uci: 'e2e4',
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        fenBefore: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        moveNumber: 1,
        color: 'w',
      },
      {
        san: 'e5',
        uci: 'e7e5',
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
        fenBefore: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        moveNumber: 1,
        color: 'b',
      },
    ]

    const evaluations = [20, 25, 20] // start, after e4, after e5
    const bestMoves = ['e2e4', 'e7e5']
    const bestMovesSan = ['e4', 'e5']

    const analysis = buildGameAnalysis(moves, evaluations, bestMoves, bestMovesSan)

    expect(analysis.isComplete).toBe(true)
    expect(analysis.analyzedMoves).toHaveLength(2)
    expect(analysis.openingName).toBe("King's Pawn Game")
    expect(analysis.eco).toBe('C20')
    expect(analysis.white.bookMoves).toBe(1)
    expect(analysis.black.bookMoves).toBe(1)
    expect(analysis.white.accuracy).toBeGreaterThan(90)
    expect(analysis.black.accuracy).toBeGreaterThan(90)
  })
})
