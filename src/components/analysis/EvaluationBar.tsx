import { useEngineStore } from '@/store/engineStore'
import { normalizeEvalForBar } from '@/analysis/evaluation'
import { formatEval } from '@/chess/moveUtils'
import styles from './EvaluationBar.module.css'

interface Props {
  flipped?: boolean
}

export function EvaluationBar({ flipped = false }: Props) {
  const analysis = useEngineStore((s) => s.analysis)
  const { evaluation, mate, isReady } = analysis

  const normalized = isReady && evaluation !== null
    ? normalizeEvalForBar(evaluation, mate)
    : 0 // equal by default

  // +1 = White fully wins, -1 = Black fully wins
  // Bar height for White portion: 50% + normalized * 50%
  const whitePercent = Math.round(((normalized + 1) / 2) * 100)
  const clampedWhite = Math.max(5, Math.min(95, whitePercent))

  const evalLabel = isReady ? formatEval(evaluation, mate) : '...'

  const topColor = flipped ? '--color-eval-white' : '--color-eval-black'
  const bottomColor = flipped ? '--color-eval-black' : '--color-eval-white'
  const topPercent = flipped ? clampedWhite : 100 - clampedWhite
  const bottomPercent = flipped ? 100 - clampedWhite : clampedWhite

  return (
    <div className={styles.bar} role="meter" aria-label={`Evaluation: ${evalLabel}`} aria-valuenow={evaluation ?? 0}>
      <div
        className={styles.segment}
        style={{
          height: `${topPercent}%`,
          background: `var(${topColor})`,
          transition: 'height var(--transition-slow)',
        }}
      />
      <div
        className={styles.segment}
        style={{
          height: `${bottomPercent}%`,
          background: `var(${bottomColor})`,
          transition: 'height var(--transition-slow)',
        }}
      />
      <div className={styles.evalLabel}>{evalLabel}</div>
    </div>
  )
}
