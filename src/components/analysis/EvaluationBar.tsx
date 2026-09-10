import { useState } from 'react'
import { useEngineStore } from '@/store/engineStore'
import { normalizeEvalForBar } from '@/analysis/evaluation'
import styles from './EvaluationBar.module.css'

interface Props {
  flipped?: boolean
}

/** Format evaluation score e.g. "+0.3", "-1", "0.0", "+M2" */
function formatScore(cp: number | null, mate: number | null): string {
  if (mate !== null) {
    if (mate === 0) return '#'
    return mate > 0 ? `+M${mate}` : `-M${Math.abs(mate)}`
  }
  if (cp === null) return '0.0'
  const pawns = cp / 100
  if (Math.abs(pawns) < 0.05) return '0.0'
  const rounded = Number(pawns.toFixed(1))
  return rounded > 0 ? `+${rounded}` : `${rounded}`
}

export function EvaluationBar({ flipped = false }: Props) {
  const analysis = useEngineStore((s) => s.analysis)
  const isEngineEnabled = useEngineStore((s) => s.isEngineEnabled)
  const { evaluation, mate, isReady } = analysis
  const [isHovered, setIsHovered] = useState(false)

  const hasEval = isReady && isEngineEnabled && evaluation !== null
  const normalized = hasEval ? normalizeEvalForBar(evaluation, mate) : 0 // 0 = 50%

  // White portion percentage: 5..95 (always clamped so both colors remain visible)
  const whitePercent = Math.round(((normalized + 1) / 2) * 100)
  const clampedWhite = Math.max(5, Math.min(95, whitePercent))

  const evalLabel = hasEval ? formatScore(evaluation, mate) : '0.0'

  // By default (unflipped): Top is Black, Bottom is White
  // Flipped: Top is White, Bottom is Black
  const topPercent = flipped ? clampedWhite : 100 - clampedWhite
  const bottomPercent = flipped ? 100 - clampedWhite : clampedWhite

  const topColor = flipped ? '#ffffff' : '#181715'
  const bottomColor = flipped ? '#181715' : '#ffffff'

  // Leading player check
  const isWhiteLeading = mate !== null ? mate > 0 : (evaluation ?? 0) >= 0

  // Position label in winning player's section:
  // Unflipped: White is at bottom, Black is at top
  // Flipped: White is at top, Black is at bottom
  const isLabelAtBottom = flipped ? !isWhiteLeading : isWhiteLeading

  // Label text color: Always high-contrast (#111111 on White, #ffffff on Black)
  const isLabelInWhiteSegment = flipped ? !isLabelAtBottom : isLabelAtBottom
  const labelColor = isLabelInWhiteSegment ? '#111111' : '#ffffff'

  // Gradient fallback directly on bar container
  const gradient = `linear-gradient(to bottom, ${topColor} 0%, ${topColor} ${topPercent}%, ${bottomColor} ${topPercent}%, ${bottomColor} 100%)`

  return (
    <div
      className={styles.evalContainer}
      title={`Evaluation: ${evalLabel}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={styles.bar}
        role="meter"
        aria-label={`Evaluation: ${evalLabel}`}
        aria-valuenow={evaluation ?? 0}
        style={{ background: gradient }}
      >
        {/* Top segment */}
        <div
          className={styles.segment}
          style={{
            flex: `${topPercent} 1 0%`,
            background: topColor,
          }}
        />

        {/* 50% Equality reference line */}
        <div className={styles.centerLine} />

        {/* Bottom segment */}
        <div
          className={styles.segment}
          style={{
            flex: `${bottomPercent} 1 0%`,
            background: bottomColor,
          }}
        />

        {/* Numerical score on the bar */}
        <div
          className={`${styles.evalLabel} ${
            isLabelAtBottom ? styles.evalLabelBottom : styles.evalLabelTop
          }`}
          style={{ color: labelColor }}
        >
          {evalLabel}
        </div>
      </div>

      {/* Hover pill showing current number */}
      {isHovered && (
        <div className={styles.hoverPill}>
          {evalLabel}
        </div>
      )}
    </div>
  )
}
