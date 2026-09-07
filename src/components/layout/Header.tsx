import { useChessStore } from '@/store/chessStore'
import { useEngineStore } from '@/store/engineStore'
import styles from './Header.module.css'

export function Header() {
  const gameMode = useChessStore((s) => s.gameMode)
  const setGameMode = useChessStore((s) => s.setGameMode)
  const engineStrength = useChessStore((s) => s.engineStrength)
  const setEngineStrength = useChessStore((s) => s.setEngineStrength)
  const isEngineLoaded = useEngineStore((s) => s.isEngineLoaded)

  return (
    <header className={styles.header} role="banner">
      <div className={styles.inner}>
        <div className={styles.logo}>
          <span className={styles.logoIcon} aria-hidden="true">
            ♛
          </span>
          <span className={styles.logoText}>Chess Analyser</span>
        </div>

        <div className={styles.navControls}>
          <div className={styles.modeToggle} role="radiogroup" aria-label="Game Mode">
            <button
              className={`${styles.modeBtn} ${gameMode === 'local' ? styles.modeBtnActive : ''}`}
              onClick={() => setGameMode('local')}
            >
              Analysis Board
            </button>
            <button
              className={`${styles.modeBtn} ${gameMode === 'vs-engine' ? styles.modeBtnActive : ''}`}
              onClick={() => setGameMode('vs-engine')}
            >
              Play Stockfish
            </button>
          </div>

          {gameMode === 'vs-engine' && (
            <div className={styles.difficultySelect}>
              <label htmlFor="difficulty" className={styles.diffLabel}>
                Level
              </label>
              <select
                id="difficulty"
                value={engineStrength}
                onChange={(e) => setEngineStrength(Number(e.target.value))}
                className={styles.select}
              >
                <option value={2}>Beginner (800)</option>
                <option value={5}>Casual (1200)</option>
                <option value={10}>Intermediate (1600)</option>
                <option value={15}>Advanced (2000)</option>
                <option value={20}>Master (2500+)</option>
              </select>
            </div>
          )}

          <div className={styles.engineStatus}>
            <span
              className={`${styles.statusDot} ${isEngineLoaded ? styles.dotReady : styles.dotLoading}`}
            />
            <span className={styles.statusText}>
              {isEngineLoaded ? 'Stockfish 18' : 'Loading Engine…'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
