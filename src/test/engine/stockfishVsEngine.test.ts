import { describe, it, expect, beforeEach } from 'vitest'
import { useChessStore } from '@/store/chessStore'
import { useEngineStore } from '@/store/engineStore'
// import { STARTING_FEN } from '@/utils/constants'

describe('vs-engine mode state and turn logic', () => {
  beforeEach(() => {
    const state = useChessStore.getState()
    state.resetGame()
    if (state.boardFlipped) {
      state.flipBoard()
    }
    state.setGameMode('local')
    useEngineStore.getState().setEngineEnabled(true)
  })

  it('initializes in local mode and switches to vs-engine mode', () => {
    expect(useChessStore.getState().gameMode).toBe('local')
    useChessStore.getState().setGameMode('vs-engine')
    expect(useChessStore.getState().gameMode).toBe('vs-engine')
  })

  it('correctly derives player and engine colors when white (unflipped)', () => {
    const state = useChessStore.getState()
    state.setGameMode('vs-engine')
    const playerColor = state.boardFlipped ? 'b' : 'w'
    const engineColor = playerColor === 'w' ? 'b' : 'w'

    expect(playerColor).toBe('w')
    expect(engineColor).toBe('b')
    expect(state.turn).toBe('w')
    // Player moves first
    expect(state.turn === playerColor).toBe(true)
  })

  it('correctly derives player and engine colors when black (flipped board)', () => {
    const state = useChessStore.getState()
    state.setGameMode('vs-engine')
    state.flipBoard()

    const playerColor = useChessStore.getState().boardFlipped ? 'b' : 'w'
    const engineColor = playerColor === 'w' ? 'b' : 'w'

    expect(playerColor).toBe('b')
    expect(engineColor).toBe('w')
    // At start FEN, turn is 'w', which is engineColor
    expect(useChessStore.getState().turn === engineColor).toBe(true)
  })

  it('updates turn to engine after player makes a move', () => {
    const state = useChessStore.getState()
    state.setGameMode('vs-engine')

    const moved = state.makeMove('e2', 'e4')
    expect(moved).toBe(true)

    const updated = useChessStore.getState()
    expect(updated.turn).toBe('b')
    expect(updated.currentFen).toContain(' b ')

    const playerColor = updated.boardFlipped ? 'b' : 'w'
    const engineColor = playerColor === 'w' ? 'b' : 'w'
    expect(updated.turn === engineColor).toBe(true)
  })

  it('engine move updates turn back to player', () => {
    const state = useChessStore.getState()
    state.setGameMode('vs-engine')

    // Player move
    state.makeMove('e2', 'e4')

    // Simulated engine response (e7e5)
    const engineMoved = state.makeMove('e7', 'e5')
    expect(engineMoved).toBe(true)

    const updated = useChessStore.getState()
    expect(updated.turn).toBe('w')
    const playerColor = updated.boardFlipped ? 'b' : 'w'
    expect(updated.turn === playerColor).toBe(true)
    expect(updated.moveHistory.length).toBe(2)
  })
})
