import { describe, it, expect } from 'vitest'
import { parseUCILine } from '@/engine/uciParser'

describe('uciParser', () => {
  it('parses readyok', () => {
    expect(parseUCILine('readyok').type).toBe('readyok')
  })

  it('parses uciok', () => {
    expect(parseUCILine('uciok').type).toBe('uciok')
  })

  it('parses bestmove', () => {
    const result = parseUCILine('bestmove e2e4 ponder e7e5')
    expect(result.type).toBe('bestmove')
    expect(result.bestmove?.move).toBe('e2e4')
    expect(result.bestmove?.ponder).toBe('e7e5')
  })

  it('parses bestmove without ponder', () => {
    const result = parseUCILine('bestmove e2e4')
    expect(result.type).toBe('bestmove')
    expect(result.bestmove?.move).toBe('e2e4')
    expect(result.bestmove?.ponder).toBeUndefined()
  })

  it('parses info with cp score', () => {
    const line = 'info depth 18 seldepth 24 multipv 1 score cp 72 nodes 1234567 nps 890000 pv e2e4 e7e5 g1f3'
    const result = parseUCILine(line)
    expect(result.type).toBe('info')
    expect(result.info?.depth).toBe(18)
    expect(result.info?.seldepth).toBe(24)
    expect(result.info?.multipv).toBe(1)
    expect(result.info?.score).toEqual({ type: 'cp', value: 72 })
    expect(result.info?.nodes).toBe(1234567)
    expect(result.info?.nps).toBe(890000)
    expect(result.info?.pv).toEqual(['e2e4', 'e7e5', 'g1f3'])
  })

  it('parses info with mate score', () => {
    const line = 'info depth 5 score mate 3 pv e1g1 e8g8 d1d8'
    const result = parseUCILine(line)
    expect(result.type).toBe('info')
    expect(result.info?.score).toEqual({ type: 'mate', value: 3 })
  })

  it('parses negative cp score', () => {
    const line = 'info depth 10 score cp -150 pv a7a5'
    const result = parseUCILine(line)
    expect(result.info?.score).toEqual({ type: 'cp', value: -150 })
  })

  it('parses negative mate score', () => {
    const line = 'info depth 3 score mate -2 pv e8g8'
    const result = parseUCILine(line)
    expect(result.info?.score).toEqual({ type: 'mate', value: -2 })
  })

  it('returns unknown for unrecognized lines', () => {
    expect(parseUCILine('option name Hash type spin default 16').type).toBe('unknown')
    expect(parseUCILine('id name Stockfish 16').type).toBe('unknown')
  })
})
