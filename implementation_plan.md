# Chess Analysis Platform — Architecture Plan (Phase 0)

## Overview

A production-quality, client-side chess web application with real-time Stockfish analysis, modeled after Chess.com's analysis board experience. Built with React, TypeScript, Vite, and Stockfish WASM running inside a Web Worker.

---

## A. Final Technology Stack

| Layer             | Technology                     | Rationale                                              |
| ----------------- | ------------------------------ | ------------------------------------------------------ |
| **Framework**     | React 18 + TypeScript          | Component model, concurrent features, type safety      |
| **Build Tool**    | Vite 5                         | Fast HMR, native ESM, WASM support out of the box      |
| **Chess Logic**   | `chess.js` v1                  | Battle-tested rules engine, FEN/PGN/SAN/validation     |
| **Chessboard UI** | `react-chessboard`             | Accessible, drag-drop, arrow support, customizable     |
| **Engine**        | `stockfish.js` (WASM build)    | Browser-native, no server required                     |
| **Charting**      | `recharts`                     | Declarative, React-native evaluation graph             |
| **State**         | `zustand`                      | Lightweight, no boilerplate, selector-based re-renders |
| **Styling**       | Vanilla CSS (CSS Modules)      | Zero runtime, scoped, no Tailwind lock-in              |
| **Testing**       | Vitest + React Testing Library | Vite-native, fast, same config                         |
| **Linting**       | ESLint + Prettier              | Consistent code style                                  |

> **Why zustand over Redux?** Redux adds significant boilerplate for a single-user client app. Zustand gives us slices, selectors, and subscriptions with minimal overhead. The architecture easily swaps to Redux/Context later.

> **Why `react-chessboard`?** It ships with built-in arrow drawing, drag-and-drop, piece customization, and correct orientation support. Building a raw SVG board is weeks of work for little benefit.

> **Why Stockfish WASM?** The standard `stockfish.js` npm package ships a WASM build that runs inside a Web Worker with zero server infrastructure.

---

## B. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     REACT UI (Main Thread)                  │
│                                                             │
│  ChessBoard  ←─────────────────────────────────────────┐    │
│  MoveList    ←──  Zustand Stores  ──→  AnalysisPanel   │    │
│  EvalGraph   ←─────────────────────────────────────────┘    │
│                         │  ↑                                │
│                   hooks │  │ state updates                  │
│                         ↓  │                                │
│              ┌──────────────────────┐                       │
│              │   useChessGame       │  chess state          │
│              │   useStockfish       │  engine bridge        │
│              │   useGameAnalysis    │  analysis runner      │
│              └──────────┬───────────┘                       │
└─────────────────────────│────────────────────────────────── ┘
                          │ postMessage / onmessage
┌─────────────────────────│───────────────────────────────── ┐
│                  WEB WORKER THREAD                         │
│                         │                                  │
│              ┌──────────▼───────────┐                      │
│              │  stockfish.worker.ts │                      │
│              │  • message router    │                      │
│              │  • lifecycle mgmt    │                      │
│              └──────────┬───────────┘                      │
│                         │ UCI text commands                │
│              ┌──────────▼───────────┐                      │
│              │   Stockfish WASM     │                      │
│              │   (native engine)    │                      │
│              └──────────┬───────────┘                      │
│                         │ UCI text responses               │
│              ┌──────────▼───────────┐                      │
│              │   uciParser.ts       │                      │
│              └──────────┬───────────┘                      │
│                         │ typed EngineMessage objects      │
└─────────────────────────│───────────────────────────────── ┘
                          │ postMessage back to main thread
                          ▼
              ┌───────────────────────┐
              │  StockfishEngine.ts   │  (main thread manager)
              │  • request ID system  │
              │  • stale guard        │
              │  • FEN cache          │
              └───────────────────────┘
```

---

## C. Folder Structure

```
chess-analyser/
├── public/
│   └── stockfish/            # Stockfish WASM assets (copied at build)
│       ├── stockfish.js
│       ├── stockfish.wasm
│       └── stockfish.worker.js
│
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   │
│   ├── components/
│   │   ├── chessboard/
│   │   │   ├── ChessBoard.tsx          # Board + piece rendering
│   │   │   ├── ChessBoard.module.css
│   │   │   ├── BoardSquare.tsx         # Individual square highlights
│   │   │   └── MoveArrow.tsx           # Best-move arrow overlay
│   │   │
│   │   ├── analysis/
│   │   │   ├── AnalysisPanel.tsx       # Right panel container
│   │   │   ├── EvaluationBar.tsx       # Vertical eval bar
│   │   │   ├── EngineLines.tsx         # Multi-PV variation list
│   │   │   ├── EngineLine.tsx          # Single PV line
│   │   │   └── AnalysisControls.tsx    # Depth, MultiPV, Start/Stop
│   │   │
│   │   ├── game/
│   │   │   ├── MoveList.tsx            # Scrollable move history
│   │   │   ├── GameControls.tsx        # Nav arrows, flip, reset
│   │   │   ├── GameStatus.tsx          # Check/Checkmate/Draw banner
│   │   │   ├── PgnImport.tsx           # PGN paste/upload dialog
│   │   │   └── FenDisplay.tsx          # FEN + copy button
│   │   │
│   │   ├── graph/
│   │   │   └── EvaluationGraph.tsx     # Recharts line chart
│   │   │
│   │   ├── summary/
│   │   │   └── GameSummary.tsx         # Post-analysis stats
│   │   │
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Layout.tsx
│   │
│   ├── chess/
│   │   ├── ChessGame.ts                # chess.js wrapper + history
│   │   ├── fen.ts                      # FEN validation helpers
│   │   ├── pgn.ts                      # PGN parse/export helpers
│   │   └── moveUtils.ts                # SAN ↔ UCI conversion, coords
│   │
│   ├── engine/
│   │   ├── StockfishEngine.ts          # Main-thread engine manager
│   │   ├── stockfish.worker.ts         # Web Worker entry point
│   │   ├── uciParser.ts                # Raw UCI string → typed objects
│   │   └── engineTypes.ts             # All engine-related TS types
│   │
│   ├── store/
│   │   ├── chessStore.ts               # Zustand: chess game state
│   │   ├── engineStore.ts              # Zustand: engine/analysis state
│   │   └── analysisStore.ts            # Zustand: full game analysis
│   │
│   ├── hooks/
│   │   ├── useChessGame.ts             # Chess moves, history, navigation
│   │   ├── useStockfish.ts             # Engine lifecycle + real-time eval
│   │   └── useGameAnalysis.ts          # Full game analysis runner
│   │
│   ├── analysis/
│   │   ├── evaluation.ts               # Score normalization, mate handling
│   │   ├── moveClassification.ts       # Best/Excellent/Inaccuracy/Blunder
│   │   └── gameAnalyzer.ts             # Sequential position analyzer
│   │
│   ├── types/
│   │   ├── chess.ts                    # Chess domain types
│   │   ├── engine.ts                   # Engine/UCI types
│   │   └── analysis.ts                 # Game analysis types
│   │
│   ├── utils/
│   │   └── constants.ts                # Thresholds, defaults
│   │
│   └── styles/
│       ├── global.css
│       └── variables.css               # CSS custom properties / design tokens
│
├── tests/
│   ├── chess/
│   │   ├── ChessGame.test.ts
│   │   └── fen.test.ts
│   ├── engine/
│   │   ├── uciParser.test.ts
│   │   └── StockfishEngine.test.ts
│   └── analysis/
│       ├── moveClassification.test.ts
│       └── gameAnalyzer.test.ts
│
├── vite.config.ts
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc
└── README.md
```

---

## D. Data Flow

### Move Execution Flow

```
User drags piece (e2 → e4)
        │
        ▼
useChessGame.makeMove("e2", "e4")
        │
        ▼
chess.js validates + executes move
        │
        ├─ invalid → show illegal move indicator
        │
        ▼
chessStore updates:
  • position (new FEN)
  • moveHistory (append)
  • currentMoveIndex++
  • turn
  • gameStatus
        │
        ▼
useStockfish detects FEN change (via store subscription)
        │
        ▼
StockfishEngine.analyze(newFen, requestId++)
        │
        ▼
Worker: "position fen <FEN>\ngo depth 20 multipv 3"
        │
        ▼
Stockfish WASM calculates…
        │
        ▼ (progressive, every depth level)
uciParser parses "info depth N score cp X pv …"
        │
        ▼
engineStore updates (guarded by requestId):
  • evaluation
  • bestMove
  • principalVariation
  • depth
        │
        ▼
React re-renders:
  EvaluationBar, EngineLines, MoveArrow
```

### Navigation Flow

```
User clicks move #12 in MoveList
        │
        ▼
useChessGame.goToMove(12)
        │
        ▼
chessStore sets currentMoveIndex = 12
        │
        ▼
Derive FEN from moveHistory[12]
        │
        ▼
chessStore.currentFen = fen12
        │
        ▼
Board re-renders at move 12 position
        │
        ▼
StockfishEngine analyzes fen12
```

---

## E. Stockfish / Web Worker Architecture

### Worker Message Protocol

```typescript
// Main → Worker
type WorkerCommand =
  | { type: 'init' }
  | { type: 'uci_command'; payload: string } // raw UCI string
  | { type: 'terminate' }

// Worker → Main
type WorkerMessage =
  | { type: 'ready' }
  | { type: 'uci_response'; payload: string } // raw UCI line
  | { type: 'error'; payload: string }
```

The Worker is intentionally thin — it just proxies UCI strings. All parsing happens on the main thread in `uciParser.ts`. This keeps the Worker minimal, testable, and replaceable.

### Request ID / Stale Guard

```typescript
// StockfishEngine.ts (simplified)
class StockfishEngine {
  private currentRequestId = 0

  analyze(fen: string, options: AnalysisOptions) {
    const requestId = ++this.currentRequestId
    this.stopCurrentAnalysis()

    this.worker.postMessage({ type: 'uci_command', payload: `position fen ${fen}` })
    this.worker.postMessage({
      type: 'uci_command',
      payload: `go depth ${options.depth} multipv ${options.multiPV}`,
    })

    this.worker.onmessage = (e) => {
      if (requestId !== this.currentRequestId) return // STALE — discard
      const parsed = parseUCI(e.data.payload)
      engineStore.setState(parsed)
    }
  }
}
```

### Analysis Cache

```typescript
// FEN → EngineAnalysis (capped at 200 entries, LRU eviction)
const analysisCache = new Map<string, EngineAnalysis>()
```

When the user navigates back to a previously analyzed position, we surface the cached result immediately and skip re-analysis (unless depth settings changed).

---

## F. Required Dependencies

### Production

| Package            | Version  | Purpose                     |
| ------------------ | -------- | --------------------------- |
| `chess.js`         | `^1.0.0` | Chess rules, FEN, PGN, SAN  |
| `react-chessboard` | `^4.x`   | Board UI, drag-drop, arrows |
| `stockfish`        | `^16.x`  | Stockfish WASM engine       |
| `zustand`          | `^4.x`   | State management            |
| `recharts`         | `^2.x`   | Evaluation graph            |

### Development

| Package                  | Purpose            |
| ------------------------ | ------------------ |
| `vite`                   | Build tool         |
| `@vitejs/plugin-react`   | React fast refresh |
| `typescript`             | Type checking      |
| `vitest`                 | Unit testing       |
| `@testing-library/react` | Component testing  |
| `eslint` + `prettier`    | Code quality       |
| `@types/chess.js`        | TS types           |

> **Note on Stockfish WASM:** The `stockfish` npm package ships `stockfish.js` (JS+WASM) that can be loaded inside a Web Worker. Vite requires explicit `?worker` import syntax and WASM asset handling — we'll configure this in `vite.config.ts` with `assetsInclude: ['**/*.wasm']`.

---

## G. Development Phases

| Phase  | Focus              | Deliverable                                 |
| ------ | ------------------ | ------------------------------------------- |
| **0**  | Architecture       | This document ✓                             |
| **1**  | Project Setup      | Vite + React + TS running, folder structure |
| **2**  | Chessboard         | Legal moves, history, undo, flip, reset     |
| **3**  | FEN / PGN          | Import, export, navigation                  |
| **4**  | Stockfish          | Worker, UCI, parser, basic eval proof       |
| **5**  | Real-Time Analysis | Eval bar, depth, PV, stale guard            |
| **6**  | Analysis UI        | Engine lines, MultiPV, arrows, controls     |
| **7**  | Game Analysis      | Per-move eval, classification, sequential   |
| **8**  | Evaluation Graph   | Recharts graph, click-to-navigate           |
| **9**  | Stockfish Opponent | Play vs engine, async moves, difficulty     |
| **10** | Polish             | Responsive, a11y, animations, perf, tests   |

Each phase ends with a working, verifiable application state before proceeding.

---

## H. Potential Technical Risks

### 🔴 High Risk

| Risk                                      | Mitigation                                                                                                                                                                                              |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Stockfish WASM cross-origin isolation** | WASM + SharedArrayBuffer requires `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers. We'll configure Vite dev server and note deployment requirements. |
| **Stockfish npm package API instability** | The `stockfish` package has had breaking changes between versions. We'll pin to a specific version and test the Worker import path carefully.                                                           |
| **Web Worker WASM loading in Vite**       | Vite's `?worker` syntax and WASM imports need careful configuration. We'll test this in Phase 4 before building on top of it.                                                                           |

### 🟡 Medium Risk

| Risk                                     | Mitigation                                                                                                                   |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Stale analysis overwriting**           | Explicit `requestId` counter — already designed into the architecture                                                        |
| **Sequential game analysis performance** | N×2 Stockfish calls (before + after each move). We'll serialize with async queuing and show a progress indicator             |
| **Memory leaks from Worker**             | Explicit `terminate()` on unmount, engine cleanup in all paths                                                               |
| **chess.js v1 API changes**              | v1 has a different API from v0.x. We'll use the v1 API exclusively and wrap it in `ChessGame.ts` to isolate breaking changes |

### 🟢 Low Risk

| Risk                                 | Mitigation                                                   |
| ------------------------------------ | ------------------------------------------------------------ |
| **react-chessboard arrow conflicts** | Library has built-in custom arrow support; we'll use its API |
| **Recharts responsive sizing**       | Use `ResponsiveContainer` wrapper                            |
| **Mobile chessboard usability**      | `react-chessboard` has touch support built in                |

---

## I. How Real-Time Analysis Works

### The Core Loop

```
User makes move
      │
      ▼
StockfishEngine.analyze(fen, { depth: 20, multiPV: 3 })
      │
      ├── Stop previous analysis:  "stop\n"
      ├── Set new position:        "position fen <FEN>\n"
      └── Start search:            "go depth 20 multipv 3\n"
                    │
                    ▼ (Stockfish processes, emits progressive output)
     ┌─────────────────────────────────────────────────────┐
     │  info depth 1 score cp 30 pv e2e4                   │
     │  info depth 5 score cp 45 pv e2e4 e7e5 g1f3         │
     │  info depth 10 score cp 60 nodes 12000 nps 400000   │
     │  info depth 15 score cp 68 pv e2e4 e7e5 g1f3 ...    │
     │  info depth 20 score cp 72 pv e2e4 e7e5 ...         │
     │  bestmove e2e4 ponder e7e5                          │
     └─────────────────────────────────────────────────────┘
                    │
                    ▼ (each line triggers a store update)
      engineStore updates progressively:
        evaluation: 0.30 → 0.45 → 0.60 → 0.68 → 0.72
        depth:      1    → 5    → 10   → 15   → 20
        bestMove:   "e2e4" (from first depth)
        pv:         grows longer with depth
                    │
                    ▼
      React re-renders ONLY changed parts:
        EvaluationBar (smooth CSS transition)
        EngineLines   (update in place)
        MoveArrow     (updates to new best move)
```

### Why It Feels Real-Time

- Zustand uses **shallow equality** selectors — only the specific component subscribed to `evaluation` re-renders when `evaluation` changes, not the whole tree.
- `EvaluationBar` uses a **CSS `transition`** on the bar height, giving smooth animation between engine depths.
- The arrow component updates at **each depth increment**, so the recommended move is visible almost immediately (depth 1 = instant).
- The "stale guard" ensures navigating away mid-analysis never corrupts the display.

### UCI Response Parsing

```typescript
// uciParser.ts parses lines like:
// "info depth 18 score cp 72 multipv 1 pv e2e4 e7e5 g1f3 nc6"

interface ParsedInfo {
  depth?: number
  score?: { type: 'cp' | 'mate'; value: number }
  multipv?: number
  pv?: string[] // array of UCI move strings
  nodes?: number
  nps?: number
  time?: number
}
```

Evaluation is normalized: `+` means White advantage, `-` means Black advantage, regardless of who is to move. Mate scores are handled separately (`#3` = mate in 3).

---

## Open Questions

> [!IMPORTANT]
> **Stockfish version:** Should we use Stockfish 16 (latest stable) or Stockfish 17 (dev)? Stockfish 16 has more stable npm packaging.

> [!IMPORTANT]
> **Board theme:** Do you want a specific color scheme (e.g., green classic, blue, wood grain)? Or should I choose a clean default and make it configurable later?

> [!NOTE]
> **Analysis depth default:** Phase 5 will default to depth 20 for real-time and depth 18 for full game analysis (for speed). These are configurable — just confirming the defaults are acceptable.

> [!NOTE]
> **Move classification thresholds:** I'll use these defaults (easily changed in `constants.ts`):
>
> - Best: loss ≤ 0.02
> - Excellent: loss ≤ 0.05
> - Good: loss ≤ 0.10
> - Inaccuracy: loss ≤ 0.25
> - Mistake: loss ≤ 0.50
> - Blunder: loss > 0.50
