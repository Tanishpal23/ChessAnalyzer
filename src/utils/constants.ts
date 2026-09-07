// ─── Engine Defaults ───────────────────────────────────────────────────────

export const DEFAULT_ANALYSIS_DEPTH = 20
export const DEFAULT_MULTIPV = 3
export const ENGINE_HASH_MB = 32

/** Max analysis depth for full game analysis (faster per-move, ~200ms in single-threaded WASM) */
export const GAME_ANALYSIS_DEPTH = 10

// ─── Move Classification Thresholds (Lichess win-chance model) ─────────────

/**
 * Win-chance is computed as: 50 + 50 * tanh(cp / 600)
 * These are the MAX win-chance loss for each tier (0–100 scale).
 *
 * Source: Lichess open-source code (lila)
 */
export const CLASSIFICATION_THRESHOLDS = {
  best: 0,       // must be engine's top choice
  excellent: 2,  // ≤ 2% win-chance loss
  good: 5,       // ≤ 5% win-chance loss
  inaccuracy: 10, // ≤ 10% win-chance loss
  mistake: 20,   // ≤ 20% win-chance loss
  // blunder: > 20%
} as const

// ─── Evaluation Bar ────────────────────────────────────────────────────────

/** Centipawns at which the bar is fully one color (clamp visual only) */
export const EVAL_BAR_CLAMP_CP = 1000

// ─── Starting Position ────────────────────────────────────────────────────

export const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

// ─── Analysis Cache ───────────────────────────────────────────────────────

/** Max cached positions before LRU eviction */
export const ANALYSIS_CACHE_SIZE = 200

// ─── Colors (minimal palette) ─────────────────────────────────────────────
// These mirror CSS variables but are available in JS for recharts etc.
export const COLORS = {
  white: '#ffffff',
  black: '#1a1a1a',
  accent: '#5b8dd9',
  positive: '#5b8dd9', // White advantage (blue-ish)
  negative: '#1a1a1a', // Black advantage
  best: '#22c55e',
  excellent: '#86efac',
  good: '#d4d4d4',
  inaccuracy: '#fbbf24',
  mistake: '#f97316',
  blunder: '#ef4444',
} as const
