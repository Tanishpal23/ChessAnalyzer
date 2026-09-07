import { useChessGame } from '@/hooks/useChessGame'
import styles from './GameControls.module.css'

interface Props {
  onImportPgn?: () => void
  onExportPgn?: () => void
  onLoadFen?: () => void
}

export function GameControls({ onImportPgn, onExportPgn, onLoadFen }: Props) {
  const {
    goToFirst, goToPrev, goToNext, goToLast,
    resetGame, flipBoard,
    canGoBack, canGoForward,
  } = useChessGame()

  return (
    <div className={styles.controls}>
      {/* Navigation */}
      <div className={styles.navGroup} role="group" aria-label="Move navigation">
        <button
          className={styles.navBtn}
          onClick={goToFirst}
          disabled={!canGoBack}
          aria-label="First move"
          title="First move"
        >
          ⟪
        </button>
        <button
          className={styles.navBtn}
          onClick={goToPrev}
          disabled={!canGoBack}
          aria-label="Previous move"
          title="Previous move"
        >
          ‹
        </button>
        <button
          className={styles.navBtn}
          onClick={goToNext}
          disabled={!canGoForward}
          aria-label="Next move"
          title="Next move"
        >
          ›
        </button>
        <button
          className={styles.navBtn}
          onClick={goToLast}
          disabled={!canGoForward}
          aria-label="Last move"
          title="Last move"
        >
          ⟫
        </button>
      </div>

      <div className={styles.separator} aria-hidden="true" />

      {/* Board / game actions */}
      <div className={styles.actionGroup} role="group" aria-label="Game actions">
        <button
          className={styles.actionBtn}
          onClick={flipBoard}
          aria-label="Flip board"
          title="Flip board"
        >
          ⇅ Flip
        </button>
        <button
          className={styles.actionBtn}
          onClick={resetGame}
          aria-label="New game"
          title="New game"
        >
          ↺ Reset
        </button>
        <button
          className={styles.actionBtn}
          onClick={onImportPgn}
          aria-label="Import PGN"
          title="Import PGN"
        >
          ↑ PGN
        </button>
        <button
          className={styles.actionBtn}
          onClick={onExportPgn}
          aria-label="Export PGN"
          title="Export PGN"
        >
          ↓ PGN
        </button>
        <button
          className={styles.actionBtn}
          onClick={onLoadFen}
          aria-label="Load FEN"
          title="Load FEN"
        >
          FEN
        </button>
      </div>
    </div>
  )
}
