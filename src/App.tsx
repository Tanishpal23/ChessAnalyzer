import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { ChessBoard } from '@/components/chessboard/ChessBoard'
import { EvaluationBar } from '@/components/analysis/EvaluationBar'
import { EngineLines } from '@/components/analysis/EngineLines'
import { MoveList } from '@/components/game/MoveList'
import { GameControls } from '@/components/game/GameControls'
import { GameStatus } from '@/components/game/GameStatus'
import { FenDisplay } from '@/components/game/FenDisplay'
import { PgnImport } from '@/components/game/PgnImport'
import { EvaluationGraph } from '@/components/graph/EvaluationGraph'
import { GameSummary } from '@/components/summary/GameSummary'
import { useStockfish } from '@/hooks/useStockfish'
import { useChessStore } from '@/store/chessStore'
import styles from './App.module.css'

export default function App() {
  // Mount engine at app root — single instance for entire lifetime
  const { engineError } = useStockfish()

  const [showPgnImport, setShowPgnImport] = useState(false)
  const boardFlipped = useChessStore((s) => s.boardFlipped)
  const exportPgn = useChessStore((s) => s.exportPgn)

  const handleExportPgn = () => {
    const pgn = exportPgn()
    if (!pgn) return
    const blob = new Blob([pgn], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'game.pgn'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={styles.app}>
      <Header />

      {engineError && (
        <div className={styles.engineError} role="alert">
          ⚠ Engine status: {engineError}
        </div>
      )}

      <main className={styles.main}>
        {/* Left: eval bar + board + controls */}
        <section className={styles.boardSection} aria-label="Chess board">
          <div className={styles.boardRow}>
            <EvaluationBar flipped={boardFlipped} />
            <div className={styles.boardAndControls}>
              <ChessBoard />
              <div className={styles.belowBoard}>
                <GameStatus />
                <GameControls
                  onImportPgn={() => setShowPgnImport(true)}
                  onExportPgn={handleExportPgn}
                />
              </div>
              <FenDisplay />
            </div>
          </div>
        </section>

        {/* Right: engine analysis + move list + review + graph */}
        <aside className={styles.sidebar} aria-label="Analysis panel">
          <EngineLines />
          <MoveList />
          <EvaluationGraph />
          <GameSummary />
        </aside>
      </main>

      {showPgnImport && <PgnImport onClose={() => setShowPgnImport(false)} />}
    </div>
  )
}
