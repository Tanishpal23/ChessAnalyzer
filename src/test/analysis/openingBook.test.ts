import { describe, it, expect } from 'vitest'
import { identifyOpening, isOpeningBookMove, OPENING_DATABASE } from '@/analysis/openingBook'

describe('openingBook', () => {
  it('loads database with more than 100 opening variations', () => {
    expect(OPENING_DATABASE.length).toBeGreaterThanOrEqual(100)
  })

  it('identifies base move 1. e4 as King\'s Pawn Opening', () => {
    const result = identifyOpening([{ uci: 'e2e4' }])
    expect(result).not.toBeNull()
    expect(result?.eco).toBe('B00')
    expect(result?.name).toBe("King's Pawn Opening")
  })

  it('identifies base move 1. d4 as Queen\'s Pawn Opening', () => {
    const result = identifyOpening([{ uci: 'd2d4' }])
    expect(result).not.toBeNull()
    expect(result?.eco).toBe('A40')
    expect(result?.name).toBe("Queen's Pawn Opening")
  })

  it('identifies Italian Game: Giuoco Piano (1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5)', () => {
    const moves = [
      { uci: 'e2e4' },
      { uci: 'e7e5' },
      { uci: 'g1f3' },
      { uci: 'b8c6' },
      { uci: 'f1c4' },
      { uci: 'f8c5' },
    ]
    const result = identifyOpening(moves)
    expect(result).not.toBeNull()
    expect(result?.eco).toBe('C50')
    expect(result?.name).toContain('Giuoco Piano')
  })

  it('identifies Sicilian Defense: Najdorf Variation', () => {
    const moves = [
      { uci: 'e2e4' },
      { uci: 'c7c5' },
      { uci: 'g1f3' },
      { uci: 'd7d6' },
      { uci: 'd2d4' },
      { uci: 'c5d4' },
      { uci: 'f3d4' },
      { uci: 'g8f6' },
      { uci: 'b1c3' },
      { uci: 'a7a6' },
    ]
    const result = identifyOpening(moves)
    expect(result).not.toBeNull()
    expect(result?.eco).toBe('B90')
    expect(result?.name).toBe('Sicilian Defense: Najdorf Variation')
  })

  it('identifies London System lines', () => {
    const moves = [
      { uci: 'd2d4' },
      { uci: 'd7d5' },
      { uci: 'g1f3' },
      { uci: 'g8f6' },
      { uci: 'c1f4' },
    ]
    const result = identifyOpening(moves)
    expect(result).not.toBeNull()
    expect(result?.eco).toBe('D02')
    expect(result?.name).toContain('London System')
  })

  it('identifies French Defense: Advance Variation', () => {
    const moves = [
      { uci: 'e2e4' },
      { uci: 'e7e6' },
      { uci: 'd2d4' },
      { uci: 'd7d5' },
      { uci: 'e4e5' },
    ]
    const result = identifyOpening(moves)
    expect(result).not.toBeNull()
    expect(result?.eco).toBe('C02')
    expect(result?.name).toContain('Advance')
  })

  it('correctly tracks isOpeningBookMove for theory plies and out-of-book moves', () => {
    const moves = [
      { uci: 'e2e4' },
      { uci: 'e7e5' },
      { uci: 'g1f3' },
      { uci: 'b8c6' },
      { uci: 'f1c4' },
      { uci: 'f8c5' },
      { uci: 'h2h4' }, // out of theory
    ]

    expect(isOpeningBookMove(moves, 0)).toBe(true) // e4
    expect(isOpeningBookMove(moves, 1)).toBe(true) // e5
    expect(isOpeningBookMove(moves, 2)).toBe(true) // Nf3
    expect(isOpeningBookMove(moves, 3)).toBe(true) // Nc6
    expect(isOpeningBookMove(moves, 4)).toBe(true) // Bc4
    expect(isOpeningBookMove(moves, 5)).toBe(true) // Bc5
    expect(isOpeningBookMove(moves, 6)).toBe(false) // h4 is not in book
  })
})
