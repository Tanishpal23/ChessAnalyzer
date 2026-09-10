import { useMemo } from 'react'
import { useChessGame } from '@/hooks/useChessGame'
import { useChessStore } from '@/store/chessStore'
import { identifyOpening } from '@/analysis/openingBook'
import styles from './GameStatus.module.css'

export function GameStatus() {
  const { gameStatus, winner, turn, boardFlipped } = useChessGame()
  const gameMode = useChessStore((s) => s.gameMode)
  const currentMoveIndex = useChessStore((s) => s.currentMoveIndex)
  const moveHistory = useChessStore((s) => s.moveHistory)

  const isReviewing = currentMoveIndex < moveHistory.length - 1
  const playerColor = boardFlipped ? 'b' : 'w'
  const engineColor = playerColor === 'w' ? 'b' : 'w'
  const isEngineTurn = gameMode === 'vs-engine' && turn === engineColor && !isReviewing

  // Current moves sequence up to the currently inspected move
  const currentMoves = useMemo(() => {
    if (moveHistory.length === 0 || currentMoveIndex < 0) return []
    return moveHistory.slice(0, currentMoveIndex + 1)
  }, [moveHistory, currentMoveIndex])

  const opening = useMemo(() => identifyOpening(currentMoves), [currentMoves])

  let statusContent = null

  if (gameStatus === 'playing') {
    if (gameMode === 'vs-engine' && !isReviewing) {
      if (isEngineTurn) {
        statusContent = (
          <div className={styles.status}>
            <span className={styles.thinkingDot} aria-hidden="true" />
            <span>Stockfish is thinking…</span>
          </div>
        )
      } else {
        statusContent = (
          <div className={styles.status}>
            <span className={styles.turn}>
              <span
                className={styles.turnDot}
                style={{
                  background: playerColor === 'w' ? '#e8e8e8' : '#1a1a1a',
                  border: playerColor === 'w' ? '1px solid #555' : 'none',
                }}
              />
              Your turn ({playerColor === 'w' ? 'White' : 'Black'})
            </span>
          </div>
        )
      }
    } else {
      statusContent = (
        <div className={styles.status}>
          <span className={styles.turn}>
            <span
              className={styles.turnDot}
              style={{
                background: turn === 'w' ? '#e8e8e8' : '#1a1a1a',
                border: turn === 'w' ? '1px solid #555' : 'none',
              }}
            />
            {turn === 'w' ? 'White' : 'Black'} to move
          </span>
        </div>
      )
    }
  } else {
    let message = 'Game over'
    if (gameStatus === 'checkmate') {
      if (gameMode === 'vs-engine') {
        message = winner === playerColor ? 'You won by checkmate!' : 'Stockfish won by checkmate'
      } else {
        message = winner ? `${winner === 'w' ? 'White' : 'Black'} wins by checkmate` : 'Checkmate'
      }
    } else if (gameStatus === 'stalemate') {
      message = 'Draw by stalemate'
    } else if (gameStatus === 'draw') {
      message = 'Draw'
    } else if (gameStatus === 'resigned') {
      message = 'Resigned'
    }

    statusContent = (
      <div className={`${styles.status} ${styles.gameOver}`} role="alert">
        <span className={styles.gameOverText}>{message}</span>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {statusContent}

      {opening && (
        <div
          className={styles.opening}
          title={`${opening.eco} • ${opening.name}`}
          aria-label={`Opening: ${opening.name} (${opening.eco})`}
        >
          <span className={styles.bookIcon} aria-hidden="true">📖</span>
          <span className={styles.ecoBadge}>{opening.eco}</span>
          <span className={styles.openingName}>{opening.name}</span>
        </div>
      )}
    </div>
  )
}
