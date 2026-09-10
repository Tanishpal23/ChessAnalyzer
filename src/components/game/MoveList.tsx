import { useEffect, useRef } from 'react'
import { useChessGame } from '@/hooks/useChessGame'
import { useAnalysisStore } from '@/store/analysisStore'
import { CLASSIFICATION_SYMBOLS } from '@/analysis/moveClassification'
import { isOpeningBookMove } from '@/analysis/openingBook'
import styles from './MoveList.module.css'

export function MoveList() {
  const { moveHistory, currentMoveIndex, goToMove } = useChessGame()
  const gameAnalysis = useAnalysisStore((s) => s.gameAnalysis)
  const activeBtnRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (activeBtnRef.current) {
      activeBtnRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [currentMoveIndex])

  if (moveHistory.length === 0) {
    return (
      <div className={styles.container}>
        <p className={styles.empty}>No moves yet</p>
      </div>
    )
  }

  // Group moves into pairs: [white move, black move?]
  const pairs: Array<[typeof moveHistory[0], typeof moveHistory[0] | null]> = []
  for (let i = 0; i < moveHistory.length; i += 2) {
    pairs.push([moveHistory[i], moveHistory[i + 1] ?? null])
  }

  return (
    <div className={styles.container} role="list" aria-label="Move list">
      <div className={styles.moves}>
        {pairs.map((pair, pairIndex) => {
          const whiteIdx = pairIndex * 2
          const blackIdx = pairIndex * 2 + 1
          const moveNumber = pair[0].moveNumber

          const whiteAnalysis = gameAnalysis?.analyzedMoves[whiteIdx]
          const blackAnalysis = pair[1] ? gameAnalysis?.analyzedMoves[blackIdx] : null

          const isWhiteLiveBook = !whiteAnalysis && isOpeningBookMove(moveHistory, whiteIdx)
          const isBlackLiveBook = pair[1] && !blackAnalysis && isOpeningBookMove(moveHistory, blackIdx)

          return (
            <div key={pairIndex} className={styles.row} role="listitem">
              <span className={styles.moveNumber}>{moveNumber}.</span>

              <button
                ref={whiteIdx === currentMoveIndex ? activeBtnRef : null}
                className={`${styles.move} ${whiteIdx === currentMoveIndex ? styles.active : ''}`}
                onClick={() => goToMove(whiteIdx)}
                aria-label={`Move ${moveNumber} White: ${pair[0].san}`}
                aria-pressed={whiteIdx === currentMoveIndex}
              >
                <span>{pair[0].san}</span>
                {whiteAnalysis ? (
                  <span
                    className={`${styles.symbol} ${styles[whiteAnalysis.classification]}`}
                    title={`${whiteAnalysis.classification} (loss: ${whiteAnalysis.winChanceLoss.toFixed(1)}%)`}
                  >
                    {CLASSIFICATION_SYMBOLS[whiteAnalysis.classification]}
                  </span>
                ) : isWhiteLiveBook ? (
                  <span
                    className={`${styles.symbol} ${styles.book}`}
                    title="Book move (Opening theory)"
                  >
                    📖
                  </span>
                ) : null}
              </button>

              {pair[1] ? (
                <button
                  ref={blackIdx === currentMoveIndex ? activeBtnRef : null}
                  className={`${styles.move} ${blackIdx === currentMoveIndex ? styles.active : ''}`}
                  onClick={() => goToMove(blackIdx)}
                  aria-label={`Move ${moveNumber} Black: ${pair[1].san}`}
                  aria-pressed={blackIdx === currentMoveIndex}
                >
                  <span>{pair[1].san}</span>
                  {blackAnalysis ? (
                    <span
                      className={`${styles.symbol} ${styles[blackAnalysis.classification]}`}
                      title={`${blackAnalysis.classification} (loss: ${blackAnalysis.winChanceLoss.toFixed(1)}%)`}
                    >
                      {CLASSIFICATION_SYMBOLS[blackAnalysis.classification]}
                    </span>
                  ) : isBlackLiveBook ? (
                    <span
                      className={`${styles.symbol} ${styles.book}`}
                      title="Book move (Opening theory)"
                    >
                      📖
                    </span>
                  ) : null}
                </button>
              ) : (
                <span className={styles.movePlaceholder} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
