import { Chess } from 'chess.js'
import { parseUCILine } from './uciParser'
import type { EngineAnalysis, EngineVariation } from '@/types/engine'
import { DEFAULT_ANALYSIS_DEPTH, DEFAULT_MULTIPV, ENGINE_HASH_MB, ANALYSIS_CACHE_SIZE } from '@/utils/constants'

export interface AnalysisOptions {
  depth?: number
  multiPV?: number
  /** Skill level 1–20 (for opponent mode) */
  skillLevel?: number
  /** Max search time in ms (for opponent mode) */
  movetime?: number
}

export interface PositionEvaluationResult {
  evaluation: number | null
  mate: number | null
  bestMoveUci: string | null
  bestMoveSan: string | null
}

type AnalysisCallback = (analysis: EngineAnalysis) => void
type BestMoveCallback = (move: string, fen: string) => void

/**
 * StockfishEngine — main-thread manager for the Stockfish Web Worker.
 *
 * Responsibilities:
 *  - Spawn and manage the Stockfish Web Worker
 *  - Send UCI commands to the engine
 *  - Parse incoming UCI responses (via uciParser)
 *  - Guard against stale results using a monotonic requestId counter
 *  - Maintain an LRU cache of FEN → EngineAnalysis
 *  - Expose a clean async API for real-time and one-shot evaluations
 */
export class StockfishEngine {
  private worker: Worker | null = null
  private currentRequestId = 0
  private _activeRequestId = 0
  private isReady = false
  private isAnalyzing = false

  /** The FEN being analyzed in the current real-time request */
  private currentFen = ''

  /** Aggregated variations for the current request, keyed by pvIndex */
  private variationMap: Map<number, EngineVariation> = new Map()

  /** Callbacks registered by consumers */
  private onAnalysis: AnalysisCallback | null = null
  private onBestMove: BestMoveCallback | null = null
  private onReady: (() => void) | null = null
  private onError: ((msg: string) => void) | null = null

  /** Simple LRU analysis cache: FEN → EngineAnalysis */
  private cache: Map<string, EngineAnalysis> = new Map()

  /** Pending queued position when engine is busy stopping */
  private queuedAnalysis: { fen: string; opts: Required<AnalysisOptions> } | null = null

  /** Pending one-shot evaluation resolvers */
  private pendingEvalResolver: ((result: PositionEvaluationResult) => void) | null = null

  /** Current analysis options */
  private currentOptions: Required<AnalysisOptions> = {
    depth: DEFAULT_ANALYSIS_DEPTH,
    multiPV: DEFAULT_MULTIPV,
    skillLevel: 20,
    movetime: 0,
  }

  // ─── Lifecycle ─────────────────────────────────────────────────────────

  async start(): Promise<void> {
    if (this.worker) return

    try {
      // Use the lightweight single-threaded browser build (7.2MB WASM)
      this.worker = new Worker('/stockfish/stockfish-18-lite-single.js')

      this.worker.onmessage = (event: MessageEvent<string | { payload: string; type: string }>) => {
        const raw = event.data
        const line = typeof raw === 'string' ? raw : (raw?.payload ?? '')
        if (line) {
          this.handleWorkerLine(line)
        }
      }

      this.worker.onerror = (e) => {
        console.warn('Stockfish worker error:', e.message || 'Worker error')
        this.terminate()
        // Auto-recover after worker crash
        setTimeout(() => {
          this.start()
        }, 500)
      }

      // Initial UCI handshake
      this.send('uci')
      this.send('isready')
    } catch (err) {
      this.onError?.(err instanceof Error ? err.message : 'Failed to initialize engine')
    }
  }

  terminate(): void {
    if (!this.worker) return
    this.send('quit')
    this.worker.terminate()
    this.worker = null
    this.isReady = false
    this.isAnalyzing = false
    this.queuedAnalysis = null
    this.pendingEvalResolver = null
  }

  // ─── Event Registration ────────────────────────────────────────────────

  onAnalysisUpdate(cb: AnalysisCallback) { this.onAnalysis = cb }
  onBestMoveFound(cb: BestMoveCallback) { this.onBestMove = cb }
  onEngineReady(cb: () => void) {
    this.onReady = cb
    if (this.isReady) cb()
  }
  onEngineError(cb: (msg: string) => void) { this.onError = cb }

  // ─── Real-Time Analysis API ───────────────────────────────────────────

  /**
   * Analyze a position. Queues safely if the engine is already analyzing
   * to avoid issuing commands while Stockfish is in search.
   */
  analyze(fen: string, options: AnalysisOptions = {}): void {
    if (!this.worker || !this.isReady) return

    // Cancel any one-shot eval in progress
    this.pendingEvalResolver = null

    // Merge with defaults
    const opts: Required<AnalysisOptions> = {
      depth: options.depth ?? this.currentOptions.depth,
      multiPV: options.multiPV ?? this.currentOptions.multiPV,
      skillLevel: options.skillLevel ?? this.currentOptions.skillLevel,
      movetime: options.movetime ?? 0,
    }
    this.currentOptions = opts

    // Check cache first (only for full-skill analysis without movetime constraint)
    if (opts.skillLevel >= 20 && opts.movetime <= 0) {
      const cached = this.cache.get(fen)
      if (cached && cached.depth >= opts.depth) {
        this.onAnalysis?.(cached)
        this.isAnalyzing = false
        this.queuedAnalysis = null
        if (cached.bestMoveUci) {
          this.onBestMove?.(cached.bestMoveUci, fen)
        }
        return
      }
    }

    if (this.isAnalyzing) {
      // Stockfish is actively searching.
      // Queue this position and ask Stockfish to stop.
      // When Stockfish emits bestmove, queued position will start.
      this.queuedAnalysis = { fen, opts }
      this.send('stop')
      return
    }

    this.startSearch(fen, opts)
  }

  private startSearch(fen: string, opts: Required<AnalysisOptions>): void {
    const requestId = ++this.currentRequestId
    this._activeRequestId = requestId
    this.currentFen = fen
    this.variationMap.clear()
    this.isAnalyzing = true

    this.send(`setoption name MultiPV value ${opts.multiPV}`)
    this.send(`setoption name Skill Level value ${opts.skillLevel}`)
    this.send(`position fen ${fen}`)
    if (opts.movetime > 0) {
      this.send(`go depth ${opts.depth} movetime ${opts.movetime}`)
    } else {
      this.send(`go depth ${opts.depth}`)
    }
  }

  /** Stop current analysis */
  stopAnalysis(): void {
    this.queuedAnalysis = null
    if (!this.isAnalyzing) return
    this.send('stop')
    this.isAnalyzing = false
  }

  /**
   * One-shot position evaluation for sequential game analysis.
   * Analyzes the given FEN up to `depth` and resolves with the evaluation.
   */
  evaluatePosition(fen: string, depth: number = 14): Promise<PositionEvaluationResult> {
    return new Promise((resolve) => {
      if (!this.worker || !this.isReady) {
        resolve({ evaluation: 0, mate: null, bestMoveUci: null, bestMoveSan: null })
        return
      }

      // Check cache first
      const cached = this.cache.get(fen)
      if (cached && cached.depth >= depth) {
        resolve({
          evaluation: cached.evaluation,
          mate: cached.mate,
          bestMoveUci: cached.bestMoveUci,
          bestMoveSan: cached.bestMoveSan,
        })
        return
      }

      const requestId = ++this.currentRequestId
      this._activeRequestId = requestId
      this.currentFen = fen
      this.variationMap.clear()
      this.isAnalyzing = true

      this.pendingEvalResolver = (res) => {
        this.pendingEvalResolver = null
        resolve(res)
      }

      this.send('stop')
      this.send('setoption name MultiPV value 1')
      this.send(`position fen ${fen}`)
      this.send(`go depth ${depth}`)
    })
  }

  /** Update depth setting */
  setDepth(depth: number) {
    this.currentOptions.depth = depth
  }

  /** Update MultiPV setting — restarts analysis on current position */
  setMultiPV(count: number) {
    this.currentOptions.multiPV = count
    if (this.currentFen && this.isAnalyzing) {
      this.analyze(this.currentFen, this.currentOptions)
    }
  }

  /** Set skill level (1–20) for opponent mode */
  setSkillLevel(level: number) {
    this.currentOptions.skillLevel = Math.max(1, Math.min(20, level))
  }

  get ready() { return this.isReady }
  get analyzing() { return this.isAnalyzing }

  // ─── Private ───────────────────────────────────────────────────────────

  private send(command: string) {
    if (!this.worker) return
    this.worker.postMessage(command)
  }

  private handleWorkerLine(line: string) {
    const parsed = parseUCILine(line)

    if (parsed.type === 'readyok' || parsed.type === 'uciok') {
      if (!this.isReady && parsed.type === 'readyok') {
        this.isReady = true
        this.send(`setoption name Hash value ${ENGINE_HASH_MB}`)
        this.send('ucinewgame')
        this.onReady?.()
      }
      return
    }

    if (parsed.type === 'info' && parsed.info) {
      // Stale guard
      if (this._activeRequestId !== this.currentRequestId) return

      const { info } = parsed
      const pvIndex = info.multipv ?? 1

      if (info.depth !== undefined && info.score !== undefined && info.pv && info.pv.length > 0) {
        const pv = info.pv
        const scoreRaw = info.score.value
        const isMate = info.score.type === 'mate'

        // Convert score to White's perspective
        let evalWhite: number
        let mateWhite: number | null = null

        const isBlackToMove = this.currentFen.includes(' b ')
        if (isMate) {
          mateWhite = isBlackToMove ? -scoreRaw : scoreRaw
          evalWhite = mateWhite > 0 ? 30000 : -30000
        } else {
          evalWhite = isBlackToMove ? -scoreRaw : scoreRaw
        }

        // Convert PV move 0 to SAN
        let bestMoveSan = pv[0] ?? ''
        try {
          const from = pv[0].slice(0, 2)
          const to = pv[0].slice(2, 4)
          const promotion = pv[0].length > 4 ? pv[0][4] : undefined
          const tempChess = new Chess(this.currentFen)
          const moveResult = tempChess.move({ from, to, promotion })
          if (moveResult) bestMoveSan = moveResult.san
        } catch {
          // Fallback to UCI
        }

        const variation: EngineVariation = {
          pvIndex,
          evaluation: evalWhite,
          mate: mateWhite,
          pv,
          bestMoveSan,
          depth: info.depth,
        }
        this.variationMap.set(pvIndex, variation)
      }

      // Emit progressive update for real-time analysis
      const variations = Array.from(this.variationMap.values())
        .sort((a, b) => a.pvIndex - b.pvIndex)

      const primaryVariation = variations[0]
      const analysis: EngineAnalysis = {
        depth: info.depth ?? 0,
        evaluation: primaryVariation?.evaluation ?? null,
        mate: primaryVariation?.mate ?? null,
        bestMoveUci: primaryVariation?.pv[0] ?? null,
        bestMoveSan: primaryVariation?.bestMoveSan ?? null,
        variations,
        nodes: info.nodes ?? 0,
        nps: info.nps ?? 0,
        isAnalyzing: true,
        isReady: true,
      }

      this.onAnalysis?.(analysis)
    }

    if (parsed.type === 'bestmove' && parsed.bestmove) {
      this.isAnalyzing = false

      // If another position was queued while engine was stopping, launch it now!
      if (this.queuedAnalysis) {
        const next = this.queuedAnalysis
        this.queuedAnalysis = null
        this.startSearch(next.fen, next.opts)
        return
      }

      if (this._activeRequestId !== this.currentRequestId) return

      const variations = Array.from(this.variationMap.values())
        .sort((a, b) => a.pvIndex - b.pvIndex)
      const primary = variations[0]

      const finalEval: PositionEvaluationResult = {
        evaluation: primary?.evaluation ?? null,
        mate: primary?.mate ?? null,
        bestMoveUci: parsed.bestmove.move,
        bestMoveSan: primary?.bestMoveSan ?? null,
      }

      // Cache the result
      if (primary) {
        const finalAnalysis: EngineAnalysis = {
          depth: primary.depth,
          evaluation: primary.evaluation,
          mate: primary.mate,
          bestMoveUci: parsed.bestmove.move,
          bestMoveSan: primary.bestMoveSan,
          variations,
          nodes: 0,
          nps: 0,
          isAnalyzing: false,
          isReady: true,
        }
        this.cacheSet(this.currentFen, finalAnalysis)
      }

      // If a one-shot evaluatePosition was running, resolve it
      if (this.pendingEvalResolver) {
        this.pendingEvalResolver(finalEval)
      }

      this.onBestMove?.(parsed.bestmove.move, this.currentFen)
    }
  }

  private cacheSet(fen: string, analysis: EngineAnalysis) {
    if (this.cache.size >= ANALYSIS_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) this.cache.delete(firstKey)
    }
    this.cache.set(fen, analysis)
  }
}

// Singleton engine instance shared across the app
export const engine = new StockfishEngine()
