import { Chess } from 'chess.js'
import { parseUCILine } from '@/engine/uciParser'
import type { HistoryMove } from '@/types/chess'
import { buildGameAnalysis } from '@/analysis/gameAnalyzer'
import { STARTING_FEN, GAME_ANALYSIS_DEPTH } from '@/utils/constants'
import type { GameAnalysis } from '@/types/analysis'

export interface PositionEvalResult {
  evaluation: number | null
  mate: number | null
  bestMoveUci: string | null
  bestMoveSan: string | null
}

export class GameReviewRunner {
  private worker: Worker | null = null
  private cancelled = false

  async analyzeGame(
    moveHistory: HistoryMove[],
    depth: number = GAME_ANALYSIS_DEPTH,
    onProgress: (current: number, total: number) => void
  ): Promise<GameAnalysis> {
    if (moveHistory.length === 0) {
      throw new Error('No moves to analyze')
    }

    this.cancelled = false
    const totalPositions = moveHistory.length + 1

    // 1. Create a dedicated worker instance for isolated game review
    const worker = new Worker('/stockfish/stockfish-18-lite-single.js')
    this.worker = worker

    try {
      // 2. Wait for worker initialization
      await this.initWorker(worker)

      if (this.cancelled) {
        throw new Error('Analysis cancelled')
      }

      const evaluations: Array<number | null> = []
      const bestMoves: Array<string | null> = []
      const bestMovesSan: Array<string | null> = []

      // 3. Evaluate starting position (before move 0)
      onProgress(1, totalPositions)
      const startResult = await this.evaluateSinglePosition(worker, STARTING_FEN, depth)
      if (this.cancelled) throw new Error('Analysis cancelled')

      evaluations.push(startResult.evaluation ?? 0)
      bestMoves.push(startResult.bestMoveUci)
      bestMovesSan.push(startResult.bestMoveSan)

      // 4. Sequentially evaluate each position in the game
      for (let i = 0; i < moveHistory.length; i++) {
        if (this.cancelled) throw new Error('Analysis cancelled')

        onProgress(i + 2, totalPositions)
        const move = moveHistory[i]
        const result = await this.evaluateSinglePosition(worker, move.fen, depth)
        if (this.cancelled) throw new Error('Analysis cancelled')

        evaluations.push(result.evaluation)
        if (i < moveHistory.length - 1) {
          bestMoves.push(result.bestMoveUci)
          bestMovesSan.push(result.bestMoveSan)
        }
      }

      // 5. Assemble full game analysis with Lichess classification and accuracy
      return buildGameAnalysis(moveHistory, evaluations, bestMoves, bestMovesSan)
    } finally {
      worker.terminate()
      this.worker = null
    }
  }

  cancel(): void {
    this.cancelled = true
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
  }

  private initWorker(worker: Worker): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Stockfish worker initialization timed out'))
      }, 15000)

      const onMsg = (event: MessageEvent<string>) => {
        const line = typeof event.data === 'string' ? event.data.trim() : ''
        if (line === 'readyok') {
          clearTimeout(timeout)
          worker.removeEventListener('message', onMsg)
          resolve()
        }
      }

      worker.addEventListener('message', onMsg)
      worker.onerror = (e) => {
        clearTimeout(timeout)
        worker.removeEventListener('message', onMsg)
        reject(new Error(e.message || 'Worker initialization failed'))
      }

      worker.postMessage('uci')
      worker.postMessage('isready')
    })
  }

  private evaluateSinglePosition(
    worker: Worker,
    fen: string,
    depth: number
  ): Promise<PositionEvalResult> {
    return new Promise((resolve) => {
      let lastEval: number | null = null
      let lastMate: number | null = null
      let bestMoveUci: string | null = null
      let bestMoveSan: string | null = null

      const isBlackToMove = fen.includes(' b ')

      const timeout = setTimeout(() => {
        worker.removeEventListener('message', messageHandler)
        resolve({
          evaluation: lastEval ?? 0,
          mate: lastMate,
          bestMoveUci,
          bestMoveSan,
        })
      }, 8000)

      const messageHandler = (event: MessageEvent<string>) => {
        const line = typeof event.data === 'string' ? event.data : ''
        const parsed = parseUCILine(line)

        if (parsed.type === 'info' && parsed.info) {
          const { info } = parsed
          if (info.score !== undefined) {
            const scoreRaw = info.score.value
            if (info.score.type === 'mate') {
              lastMate = isBlackToMove ? -scoreRaw : scoreRaw
              lastEval = lastMate > 0 ? 30000 : -30000
            } else {
              lastMate = null
              lastEval = isBlackToMove ? -scoreRaw : scoreRaw
            }
          }
          if (info.pv && info.pv.length > 0) {
            bestMoveUci = info.pv[0]
          }
        }

        if (parsed.type === 'bestmove' && parsed.bestmove) {
          clearTimeout(timeout)
          worker.removeEventListener('message', messageHandler)

          const rawMove = parsed.bestmove.move || bestMoveUci
          const uci = rawMove === '(none)' ? null : rawMove
          if (uci && uci.length >= 4) {
            try {
              const from = uci.slice(0, 2)
              const to = uci.slice(2, 4)
              const promotion = uci.length > 4 ? uci[4] : undefined
              const tempChess = new Chess(fen)
              const moveRes = tempChess.move({ from, to, promotion })
              if (moveRes) bestMoveSan = moveRes.san
            } catch {
              bestMoveSan = uci
            }
          }

          resolve({
            evaluation: lastEval,
            mate: lastMate,
            bestMoveUci: uci,
            bestMoveSan,
          })
        }
      }

      worker.addEventListener('message', messageHandler)

      // Send search commands for this single position
      worker.postMessage('setoption name MultiPV value 1')
      worker.postMessage(`position fen ${fen}`)
      worker.postMessage(`go depth ${depth}`)
    })
  }
}
