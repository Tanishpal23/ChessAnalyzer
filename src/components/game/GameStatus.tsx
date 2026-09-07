import { useChessGame } from '@/hooks/useChessGame'
import styles from './GameStatus.module.css'

export function GameStatus() {
  const { gameStatus, winner, turn } = useChessGame()

  if (gameStatus === 'playing') {
    return (
      <div className={styles.status}>
        <span className={styles.turn}>
          <span
            className={styles.turnDot}
            style={{ background: turn === 'w' ? '#e8e8e8' : '#1a1a1a', border: turn === 'w' ? '1px solid #555' : 'none' }}
          />
          {turn === 'w' ? 'White' : 'Black'} to move
        </span>
      </div>
    )
  }

  const messages: Record<Exclude<typeof gameStatus, 'playing'>, string> = {
    checkmate: winner ? `${winner === 'w' ? 'White' : 'Black'} wins by checkmate` : 'Checkmate',
    stalemate: 'Draw by stalemate',
    draw: 'Draw',
    resigned: 'Resigned',
  }

  return (
    <div className={`${styles.status} ${styles.gameOver}`} role="alert">
      <span className={styles.gameOverText}>{messages[gameStatus]}</span>
    </div>
  )
}
