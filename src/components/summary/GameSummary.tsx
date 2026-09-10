import { useGameAnalysis } from '@/hooks/useGameAnalysis'
import { useChessGame } from '@/hooks/useChessGame'
import styles from './GameSummary.module.css'

export function GameSummary() {
  const { moveHistory } = useChessGame()
  const {
    gameAnalysis,
    isRunning,
    progress,
    currentStep,
    totalSteps,
    runGameAnalysis,
    cancelGameAnalysis,
    clearAnalysis,
  } = useGameAnalysis()

  if (moveHistory.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.startBanner}>
          <div>
            <div className={styles.title}>Game Review</div>
            <div className={styles.subtitle}>
              Play moves or import a PGN to enable full game review
            </div>
          </div>
          <button
            className={styles.analyzeBtn}
            disabled
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
          >
            Review Game
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {!gameAnalysis && !isRunning && (
        <div className={styles.startBanner}>
          <div>
            <div className={styles.title}>Game Review</div>
            <div className={styles.subtitle}>
              Full game analysis, move accuracy & classifications
            </div>
          </div>
          <button className={styles.analyzeBtn} onClick={runGameAnalysis}>
            Review Game
          </button>
        </div>
      )}

      {isRunning && (
        <div className={styles.progressContainer}>
          <div className={styles.progressHeader}>
            <span className={styles.progressText}>
              Analyzing position {currentStep} of {totalSteps}… ({Math.round(progress * 100)}%)
            </span>
            <button className={styles.cancelBtn} onClick={cancelGameAnalysis}>
              Cancel
            </button>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${Math.max(5, Math.round(progress * 100))}%` }}
            />
          </div>
        </div>
      )}

      {gameAnalysis && !isRunning && (
        <div className={styles.resultsContainer}>
          <div className={styles.resultsHeader}>
            <span className={styles.title}>Game Review</span>
            <div className={styles.headerActions}>
              <button className={styles.smallBtn} onClick={runGameAnalysis}>
                Re-analyze
              </button>
              <button className={styles.smallBtn} onClick={clearAnalysis}>
                Close
              </button>
            </div>
          </div>

          {gameAnalysis.openingName && (
            <div className={styles.openingBanner}>
              {gameAnalysis.eco && <span className={styles.ecoTag}>{gameAnalysis.eco}</span>}
              <span>{gameAnalysis.openingName}</span>
            </div>
          )}

          <div className={styles.accuracyGrid}>
            <div className={styles.accuracyCard}>
              <span className={styles.colorTag}>White</span>
              <span className={styles.accuracyVal}>{gameAnalysis.white.accuracy}%</span>
              <span className={styles.accuracyLabel}>Accuracy</span>
            </div>
            <div className={styles.accuracyCard}>
              <span className={styles.colorTag}>Black</span>
              <span className={styles.accuracyVal}>{gameAnalysis.black.accuracy}%</span>
              <span className={styles.accuracyLabel}>Accuracy</span>
            </div>
          </div>

          <div className={styles.statsTable}>
            <div className={styles.tableHeader}>
              <span>White</span>
              <span className={styles.categoryHeader}>Classification</span>
              <span>Black</span>
            </div>

            <div className={styles.statRow}>
              <span className={styles.count}>{gameAnalysis.white.brilliant}</span>
              <span className={styles.catName}>
                <span className={`${styles.badge} ${styles.badgeBrilliant}`}>!!</span> Brilliant
              </span>
              <span className={styles.count}>{gameAnalysis.black.brilliant}</span>
            </div>

            <div className={styles.statRow}>
              <span className={styles.count}>{gameAnalysis.white.greatMoves}</span>
              <span className={styles.catName}>
                <span className={`${styles.badge} ${styles.badgeGreat}`}>!</span> Great
              </span>
              <span className={styles.count}>{gameAnalysis.black.greatMoves}</span>
            </div>

            <div className={styles.statRow}>
              <span className={styles.count}>{gameAnalysis.white.bestMoves}</span>
              <span className={styles.catName}>
                <span className={`${styles.badge} ${styles.badgeBest}`}>✓</span> Best
              </span>
              <span className={styles.count}>{gameAnalysis.black.bestMoves}</span>
            </div>

            <div className={styles.statRow}>
              <span className={styles.count}>{gameAnalysis.white.excellentMoves}</span>
              <span className={styles.catName}>
                <span className={`${styles.badge} ${styles.badgeExcellent}`}>!</span> Excellent
              </span>
              <span className={styles.count}>{gameAnalysis.black.excellentMoves}</span>
            </div>

            <div className={styles.statRow}>
              <span className={styles.count}>{gameAnalysis.white.goodMoves}</span>
              <span className={styles.catName}>
                <span className={`${styles.badge} ${styles.badgeGood}`}>✓</span> Good
              </span>
              <span className={styles.count}>{gameAnalysis.black.goodMoves}</span>
            </div>

            <div className={styles.statRow}>
              <span className={styles.count}>{gameAnalysis.white.bookMoves}</span>
              <span className={styles.catName}>
                <span className={`${styles.badge} ${styles.badgeBook}`}>📖</span> Book
              </span>
              <span className={styles.count}>{gameAnalysis.black.bookMoves}</span>
            </div>

            <div className={styles.statRow}>
              <span className={styles.count}>{gameAnalysis.white.inaccuracies}</span>
              <span className={styles.catName}>
                <span className={`${styles.badge} ${styles.badgeInaccuracy}`}>?!</span> Inaccuracy
              </span>
              <span className={styles.count}>{gameAnalysis.black.inaccuracies}</span>
            </div>

            <div className={styles.statRow}>
              <span className={styles.count}>{gameAnalysis.white.mistakes}</span>
              <span className={styles.catName}>
                <span className={`${styles.badge} ${styles.badgeMistake}`}>?</span> Mistake
              </span>
              <span className={styles.count}>{gameAnalysis.black.mistakes}</span>
            </div>

            <div className={styles.statRow}>
              <span className={styles.count}>{gameAnalysis.white.missedWins}</span>
              <span className={styles.catName}>
                <span className={`${styles.badge} ${styles.badgeMissedWin}`}>❌</span> Missed Win
              </span>
              <span className={styles.count}>{gameAnalysis.black.missedWins}</span>
            </div>

            <div className={styles.statRow}>
              <span className={styles.count}>{gameAnalysis.white.blunders}</span>
              <span className={styles.catName}>
                <span className={`${styles.badge} ${styles.badgeBlunder}`}>??</span> Blunder
              </span>
              <span className={styles.count}>{gameAnalysis.black.blunders}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
