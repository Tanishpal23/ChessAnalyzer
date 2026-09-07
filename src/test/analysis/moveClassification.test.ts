import { describe, it, expect } from 'vitest'
import { classifyMove } from '@/analysis/moveClassification'
import { cpToWinChance, calcWinChanceLoss } from '@/analysis/evaluation'

describe('moveClassification', () => {
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
    // White goes from +3.0 (winning) to +2.0 (still winning but some loss)
    const loss = calcWinChanceLoss(300, null, 200, null, 'w')
    expect(loss).toBeGreaterThan(0)
    expect(loss).toBeLessThan(20)
  })

  it('calculates Black win-chance loss correctly', () => {
    // Eval goes from -3.0 (Black winning) to -2.0 (Black still winning but lost something)
    // Black's eval is FROM WHITE's POV, so -300 → -200 means Black got worse
    const loss = calcWinChanceLoss(-300, null, -200, null, 'b')
    expect(loss).toBeGreaterThan(0)
  })

  it('returns zero for non-null but no change', () => {
    const loss = calcWinChanceLoss(-50, null, -50, null, 'b')
    expect(loss).toBeCloseTo(0)
  })

  // ─── Classification thresholds ────────────────────────────────────

  it('classifies the engine top choice as best', () => {
    expect(classifyMove(5, true)).toBe('best')
  })

  it('classifies 0% loss as best', () => {
    expect(classifyMove(0, true)).toBe('best')
  })

  it('classifies 1.5% loss as excellent', () => {
    expect(classifyMove(1.5, false)).toBe('excellent')
  })

  it('classifies 4% loss as good', () => {
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

  // ─── Perspective correctness ──────────────────────────────────────

  it('White blunder: +2.5 → +0.3 should be significant loss', () => {
    const loss = calcWinChanceLoss(250, null, 30, null, 'w')
    expect(loss).toBeGreaterThan(10) // significant win-chance loss
    expect(classifyMove(loss, false)).toMatch(/mistake|blunder/)
  })

  it('Black blunder: -2.5 → -0.3 should be significant loss for Black', () => {
    const loss = calcWinChanceLoss(-250, null, -30, null, 'b')
    expect(loss).toBeGreaterThan(10)
    expect(classifyMove(loss, false)).toMatch(/mistake|blunder/)
  })
})
