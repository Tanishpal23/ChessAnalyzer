import { describe, it, expect } from 'vitest'
import { classifyMove } from '@/analysis/moveClassification'
import { cpToWinChance, calcWinChanceLoss, calcAccuracy } from '@/analysis/evaluation'

describe('moveClassification & CAPS2 accuracy', () => {
  // ─── Win chance conversion ─────────────────────────────────────────

  it('returns 50% win chance at equality', () => {
    expect(cpToWinChance(0, null)).toBeCloseTo(50, 1)
  })

  it('returns >50% win chance for positive eval', () => {
    expect(cpToWinChance(300, null)).toBeGreaterThan(50)
  })

  it('returns <50% win chance for negative eval', () => {
    expect(cpToWinChance(-300, null)).toBeLessThan(50)
  })

  it('returns 100% for White mate', () => {
    expect(cpToWinChance(0, 3)).toBe(100)
  })

  it('returns 0% for Black mate', () => {
    expect(cpToWinChance(0, -3)).toBe(0)
  })

  // ─── Win chance loss calculation ──────────────────────────────────

  it('calculates zero loss when position unchanged', () => {
    const loss = calcWinChanceLoss(100, null, 100, null, 'w')
    expect(loss).toBeCloseTo(0, 5)
  })

  it('calculates White win-chance loss correctly', () => {
    const loss = calcWinChanceLoss(300, null, 200, null, 'w')
    expect(loss).toBeGreaterThan(0)
    expect(loss).toBeLessThan(20)
  })

  it('calculates Black win-chance loss correctly', () => {
    const loss = calcWinChanceLoss(-300, null, -200, null, 'b')
    expect(loss).toBeGreaterThan(0)
  })

  // ─── Chess.com Move Classifications ───────────────────────────────

  it('classifies book moves', () => {
    expect(classifyMove({ winChanceLoss: 0.01, isEngineTopChoice: true, isBook: true })).toBe('book')
    expect(classifyMove({ winChanceLoss: 4.5, isEngineTopChoice: false, isBook: true })).toBe('book')
    expect(classifyMove({ winChanceLoss: 12.0, isEngineTopChoice: false, isBook: true })).toBe('book')
  })

  it('rejects book moves that lose severe win chance (>15%)', () => {
    expect(classifyMove({ winChanceLoss: 18.0, isEngineTopChoice: false, isBook: true })).not.toBe('book')
  })

  it('classifies brilliant move with genuine piece sacrifice in winning position', () => {
    // White sacrifices a Knight (3 pts) into an enemy pawn, remaining at +4.00 eval
    const fenBefore = 'r1bqk2r/pppp1ppp/2n5/4N3/2B1n3/8/PPPP1PPP/RNBQK2R w KQkq - 0 5' // White has N on e5
    const fenAfter = 'r1bqk2r/pppp1Bpp/2n5/8/4n3/8/PPPP1PPP/RNBQK2R b KQkq - 0 5' // Bxf7+ sacrifice
    const result = classifyMove({
      winChanceLoss: 0.005,
      isEngineTopChoice: true,
      evalBefore: 120,
      evalAfter: 350,
      playerColor: 'w',
      fenBefore,
      fenAfter,
      san: 'Bxf7+',
      uci: 'c4f7',
    })
    expect(result).toBe('brilliant')
  })

  it('classifies great move finding a critical 150+ cp swing', () => {
    const result = classifyMove({
      winChanceLoss: 0.005,
      isEngineTopChoice: true,
      evalBefore: 0,
      evalAfter: 220,
      playerColor: 'w',
      san: 'Qh5',
      uci: 'd1h5',
    })
    expect(result).toBe('great')
  })

  it('classifies missed win when a crushing advantage is thrown away', () => {
    // White was +600 (crushing win), but played a move dropping to +50
    const result = classifyMove({
      winChanceLoss: 0.35,
      isEngineTopChoice: false,
      evalBefore: 600,
      evalAfter: 50,
      playerColor: 'w',
      san: 'Qd4',
      uci: 'd1d4',
    })
    expect(result).toBe('missed_win')
  })

  it('classifies the engine top choice as best', () => {
    expect(classifyMove(5, true)).toBe('best')
  })

  it('classifies zero loss as best', () => {
    expect(classifyMove(0, true)).toBe('best')
  })

  it('classifies near-best loss as excellent', () => {
    expect(classifyMove(1.5, false)).toBe('excellent')
  })

  it('classifies moderate loss as good', () => {
    expect(classifyMove(4, false)).toBe('good')
  })

  it('classifies 8% loss as inaccuracy', () => {
    expect(classifyMove(8, false)).toBe('inaccuracy')
  })

  it('classifies 15% loss as mistake', () => {
    expect(classifyMove(15, false)).toBe('mistake')
  })

  it('classifies 25% loss as blunder', () => {
    expect(classifyMove(25, false)).toBe('blunder')
  })

  // ─── CAPS2 Accuracy Calibration ───────────────────────────────────

  it('calculates 100% accuracy for all-best moves', () => {
    expect(calcAccuracy([0, 0, 0, 0])).toBe(100)
  })

  it('calculates realistic accuracy for amateur game with mistakes and blunders', () => {
    // 5 best moves, 2 inaccuracies, 1 mistake, 1 blunder
    const losses = [0, 0, 0.5, 0, 0, 10, 12, 22, 40]
    const acc = calcAccuracy(losses)
    // Should NOT be artificially 95%+
    expect(acc).toBeGreaterThan(55)
    expect(acc).toBeLessThan(85)
  })
})
