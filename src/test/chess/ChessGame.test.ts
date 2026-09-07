import { describe, it, expect, beforeEach } from 'vitest'
import { ChessGame } from '@/chess/ChessGame'
import { STARTING_FEN } from '@/utils/constants'

describe('ChessGame', () => {
  let game: ChessGame

  beforeEach(() => {
    game = new ChessGame()
  })

  // ─── Starting State ─────────────────────────────────────────────────

  it('starts at the initial position', () => {
    expect(game.fen).toBe(STARTING_FEN)
    expect(game.turn).toBe('w')
    expect(game.history).toHaveLength(0)
  })

  // ─── Legal Moves ─────────────────────────────────────────────────────

  it('accepts a legal move', () => {
    const result = game.makeMove({ from: 'e2', to: 'e4' })
    expect(result).not.toBeNull()
    expect(result?.san).toBe('e4')
    expect(result?.uci).toBe('e2e4')
    expect(game.history).toHaveLength(1)
    expect(game.turn).toBe('b')
  })

  it('rejects an illegal move', () => {
    const result = game.makeMove({ from: 'e2', to: 'e5' })
    expect(result).toBeNull()
    expect(game.history).toHaveLength(0)
  })

  it('rejects moving opponent pieces', () => {
    const result = game.makeMove({ from: 'e7', to: 'e5' })
    expect(result).toBeNull()
  })

  // ─── Check / Checkmate ─────────────────────────────────────────────

  it('detects checkmate (Scholar\'s mate)', () => {
    game.makeMove({ from: 'e2', to: 'e4' })
    game.makeMove({ from: 'e7', to: 'e5' })
    game.makeMove({ from: 'f1', to: 'c4' })
    game.makeMove({ from: 'b8', to: 'c6' })
    game.makeMove({ from: 'd1', to: 'h5' })
    game.makeMove({ from: 'a7', to: 'a6' })
    game.makeMove({ from: 'h5', to: 'f7' })
    expect(game.isCheckmate).toBe(true)
    expect(game.isGameOver).toBe(true)
  })

  it('detects stalemate', () => {
    // Known stalemate position: Black king on a8, White queen on c7, White king on a1
    const sm = new ChessGame('k7/2Q5/8/8/8/8/8/K7 b - - 0 1')
    expect(sm.isStalemate).toBe(true)
    expect(sm.isGameOver).toBe(true)
  })

  // ─── Castling ────────────────────────────────────────────────────────

  it('allows kingside castling', () => {
    const castleGame = new ChessGame('r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4')
    const result = castleGame.makeMove({ from: 'e1', to: 'g1' })
    expect(result).not.toBeNull()
    expect(result?.san).toBe('O-O')
  })

  // ─── En Passant ──────────────────────────────────────────────────────

  it('allows en passant capture', () => {
    const epGame = new ChessGame('rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3')
    const result = epGame.makeMove({ from: 'e5', to: 'd6' })
    expect(result).not.toBeNull()
    expect(result?.san).toBe('exd6')
  })

  // ─── Promotion ───────────────────────────────────────────────────────

  it('promotes pawn to queen', () => {
    const promoGame = new ChessGame('8/P7/5k2/8/8/8/8/K7 w - - 0 1')
    const result = promoGame.makeMove({ from: 'a7', to: 'a8', promotion: 'q' })
    expect(result).not.toBeNull()
    expect(result?.san).toBe('a8=Q')
  })

  // ─── Reset & FEN Load ─────────────────────────────────────────────────

  it('resets to starting position', () => {
    game.makeMove({ from: 'e2', to: 'e4' })
    game.reset()
    expect(game.fen).toBe(STARTING_FEN)
    expect(game.history).toHaveLength(0)
  })

  it('loads a valid FEN', () => {
    const fen = 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3'
    expect(game.loadFen(fen)).toBe(true)
    expect(game.fen).toBe(fen)
    expect(game.history).toHaveLength(0)
  })

  it('rejects an invalid FEN', () => {
    expect(game.loadFen('not a fen')).toBe(false)
  })

  // ─── PGN ─────────────────────────────────────────────────────────────

  it('loads a PGN and rebuilds move history', () => {
    const pgn = '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6'
    expect(game.loadPgn(pgn)).toBe(true)
    expect(game.history).toHaveLength(6)
    expect(game.history[0].san).toBe('e4')
    expect(game.history[5].san).toBe('a6')
  })

  it('rejects invalid PGN', () => {
    expect(game.loadPgn('this is not pgn @@@@')).toBe(false)
  })

  // ─── FEN at index ────────────────────────────────────────────────────

  it('returns starting FEN for index -1', () => {
    game.makeMove({ from: 'e2', to: 'e4' })
    expect(game.fenAt(-1)).toBe(STARTING_FEN)
  })

  it('returns correct FEN at each history index', () => {
    game.makeMove({ from: 'e2', to: 'e4' })
    game.makeMove({ from: 'e7', to: 'e5' })
    const fen0 = game.fenAt(0)
    const fen1 = game.fenAt(1)
    expect(fen0).not.toBe(STARTING_FEN)
    expect(fen1).not.toBe(fen0)
  })
})
