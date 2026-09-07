import { useEngineStore } from '@/store/engineStore'
import { useChessStore } from '@/store/chessStore'
import { pvToSan } from '@/chess/pgn'
import { formatEval } from '@/chess/moveUtils'
import styles from './EngineLines.module.css'

export function EngineLines() {
  const analysis = useEngineStore((s) => s.analysis)
  const currentFen = useChessStore((s) => s.currentFen)
  const { variations, isAnalyzing, isReady, depth, nodes } = analysis

  if (!isReady) {
    return (
      <div className={styles.container}>
        <p className={styles.loading}>Loading engine…</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>Engine</span>
        <span className={styles.meta}>
          {isAnalyzing ? (
            <span className={styles.analyzing}>
              depth {depth}
              {nodes > 0 && ` • ${nodes > 1000000 ? (nodes / 1000000).toFixed(1) + 'M' : (nodes / 1000).toFixed(0) + 'k'}`}
              <span className={styles.pulse} aria-hidden="true" />
            </span>
          ) : (
            <span>
              depth {depth}
              {nodes > 0 && ` • ${nodes > 1000000 ? (nodes / 1000000).toFixed(1) + 'M' : (nodes / 1000).toFixed(0) + 'k'}`}
            </span>
          )}
        </span>
      </div>

      {variations.length === 0 ? (
        <p className={styles.waiting}>Analysing…</p>
      ) : (
        <ol className={styles.lines}>
          {variations.map((v) => {
            const sanMoves = pvToSan(currentFen, v.pv).slice(0, 8)
            const evalStr = formatEval(v.evaluation, v.mate)
            const isPositive = v.mate !== null ? v.mate > 0 : (v.evaluation ?? 0) >= 0

            return (
              <li key={v.pvIndex} className={styles.line}>
                <span
                  className={`${styles.eval} ${isPositive ? styles.evalPos : styles.evalNeg}`}
                >
                  {evalStr}
                </span>
                <span className={styles.pv}>
                  {sanMoves.join(' ')}
                  {v.pv.length > 8 ? ' …' : ''}
                </span>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
