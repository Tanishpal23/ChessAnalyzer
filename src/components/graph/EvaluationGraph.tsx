import { useMemo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import { useChessGame } from '@/hooks/useChessGame'
import { useAnalysisStore } from '@/store/analysisStore'
import styles from './EvaluationGraph.module.css'

interface ChartPoint {
  index: number
  name: string
  eval: number
  displayEval: string
}

export function EvaluationGraph() {
  const { moveHistory, currentMoveIndex, goToMove } = useChessGame()
  const gameAnalysis = useAnalysisStore((s) => s.gameAnalysis)

  const data: ChartPoint[] = useMemo(() => {
    if (!gameAnalysis || !gameAnalysis.evaluationHistory) {
      return []
    }

    const points: ChartPoint[] = []
    const evals = gameAnalysis.evaluationHistory

    // Start position
    const startCp = evals[0] ?? 0
    const startClamped = Math.max(-10, Math.min(10, startCp / 100))
    points.push({
      index: -1,
      name: 'Start',
      eval: Number(startClamped.toFixed(2)),
      displayEval: startCp >= 0 ? `+${(startCp / 100).toFixed(1)}` : `${(startCp / 100).toFixed(1)}`,
    })

    // Each move
    for (let i = 0; i < moveHistory.length; i++) {
      const move = moveHistory[i]
      const cp = evals[i + 1] ?? 0
      const clamped = Math.max(-10, Math.min(10, cp / 100))
      const prefix = cp >= 0 ? '+' : ''
      const moveLabel = move.color === 'w' ? `${move.moveNumber}. ${move.san}` : `${move.moveNumber}... ${move.san}`

      points.push({
        index: i,
        name: moveLabel,
        eval: Number(clamped.toFixed(2)),
        displayEval: `${prefix}${(cp / 100).toFixed(1)}`,
      })
    }

    return points
  }, [gameAnalysis, moveHistory])

  if (data.length === 0) {
    return null
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.title}>Game Evaluation</span>
        <span className={styles.hint}>Click graph to jump to move</span>
      </div>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart
            data={data}
            onClick={(e) => {
              if (e && e.activePayload && e.activePayload.length > 0) {
                const point = e.activePayload[0].payload as ChartPoint
                goToMove(point.index)
              }
            }}
            margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
          >
            <defs>
              <linearGradient id="evalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              hide={true}
            />
            <YAxis
              domain={[-6, 6]}
              ticks={[-4, -2, 0, 2, 4]}
              tick={{ fontSize: 10, fill: '#888' }}
              axisLine={false}
              tickLine={false}
            />
            <ReferenceLine y={0} stroke="#444" strokeDasharray="3 3" />
            {currentMoveIndex >= -1 && (
              <ReferenceLine
                x={currentMoveIndex === -1 ? 'Start' : data[currentMoveIndex + 1]?.name}
                stroke="#fff"
                strokeWidth={1.5}
              />
            )}
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length > 0) {
                  const item = payload[0].payload as ChartPoint
                  return (
                    <div className={styles.tooltip}>
                      <span className={styles.tooltipName}>{item.name}</span>
                      <span className={styles.tooltipEval}>{item.displayEval}</span>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
              dataKey="eval"
              stroke="#8884d8"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#evalGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
