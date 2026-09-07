// ─── Engine / UCI Types ────────────────────────────────────────────────────

/** A single parsed "info" line from Stockfish */
export interface UCIInfo {
  depth?: number
  seldepth?: number
  /** centipawns score (positive = side to move advantage) */
  score?: { type: 'cp'; value: number } | { type: 'mate'; value: number }
  multipv?: number
  /** Array of UCI move strings e.g. ["e2e4", "e7e5"] */
  pv?: string[]
  nodes?: number
  nps?: number
  time?: number
  hashfull?: number
}

/** Parsed "bestmove" response */
export interface UCIBestMove {
  move: string
  ponder?: string
}

/** A single engine variation (for MultiPV) */
export interface EngineVariation {
  /** multipv index (1-based) */
  pvIndex: number
  /** Evaluation in centipawns from White's perspective */
  evaluation: number
  /** Mate in N (positive = current side mates), or null */
  mate: number | null
  /** UCI move strings */
  pv: string[]
  /** Human-readable best move in SAN */
  bestMoveSan: string
  depth: number
}

/** Full engine analysis state for the current position */
export interface EngineAnalysis {
  /** Current search depth */
  depth: number
  /** Evaluation from White's perspective in centipawns */
  evaluation: number | null
  /** Mate in N from White's perspective (positive = White mates) */
  mate: number | null
  /** Best move in UCI */
  bestMoveUci: string | null
  /** Best move in SAN (requires chess context to compute) */
  bestMoveSan: string | null
  /** Multiple variations (MultiPV) */
  variations: EngineVariation[]
  nodes: number
  nps: number
  isAnalyzing: boolean
  isReady: boolean
}

/** Messages from main thread → worker */
export type WorkerInboundMessage =
  | { type: 'init' }
  | { type: 'uci_command'; payload: string }
  | { type: 'terminate' }

/** Messages from worker → main thread */
export type WorkerOutboundMessage =
  | { type: 'ready' }
  | { type: 'uci_response'; payload: string }
  | { type: 'error'; payload: string }
