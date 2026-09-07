/**
 * Stockfish Web Worker
 *
 * Loads Stockfish 18 WASM (single-threaded variant — works without SharedArrayBuffer,
 * maximally compatible). Proxies UCI strings between the main thread and the engine.
 *
 * Message protocol:
 *   IN  (main → worker): WorkerInboundMessage
 *   OUT (worker → main): WorkerOutboundMessage
 */

/// <reference lib="webworker" />

import type { WorkerInboundMessage, WorkerOutboundMessage } from '@/types/engine'

let stockfishReady = false
// Output buffer for lines received before ready
const pendingCommands: string[] = []

// Stockfish's internal postMessage / onmessage — set after init
let sfPostMessage: ((cmd: string) => void) | null = null

async function initStockfish() {
  try {
    /**
     * Stockfish 18 browser usage:
     * The WASM JS files expose themselves as a factory function when loaded as
     * a module. We import the single-threaded build which doesn't need COOP/COEP.
     *
     * The file is accessed via a URL resolved relative to this worker's location.
     * Vite copies the stockfish assets via the `?url` import mechanism.
     */
    // @ts-expect-error — dynamic import of WASM JS bundle
    const stockfishJs = await import('/stockfish/stockfish-18-single.js')

    // The WASM module factory may be default export or the module itself
    const StockfishInit = stockfishJs.default ?? stockfishJs

    // Initialize with locateFile to find the .wasm binary
    const sf = await StockfishInit({
      locateFile: (file: string) => `/stockfish/${file}`,
    })

    // Wire up output handler
    sf.addMessageListener?.((line: string) => {
      const msg: WorkerOutboundMessage = { type: 'uci_response', payload: line }
      self.postMessage(msg)
    })

    // Fallback: some builds use onmessage on the sf object
    if (!sf.addMessageListener) {
      sf.onmessage = (line: string | MessageEvent<string>) => {
        const text = typeof line === 'string' ? line : line.data
        const msg: WorkerOutboundMessage = { type: 'uci_response', payload: text }
        self.postMessage(msg)
      }
    }

    sfPostMessage = (cmd: string) => {
      sf.postMessage?.(cmd) ?? sf.sendCommand?.(cmd)
    }

    stockfishReady = true

    // Send any commands that arrived before ready
    for (const cmd of pendingCommands) {
      sfPostMessage(cmd)
    }
    pendingCommands.length = 0

    // Handshake
    sfPostMessage('uci')
    sfPostMessage('isready')

    const readyMsg: WorkerOutboundMessage = { type: 'ready' }
    self.postMessage(readyMsg)
  } catch (err) {
    const errorMsg: WorkerOutboundMessage = {
      type: 'error',
      payload: err instanceof Error ? err.message : 'Failed to load Stockfish WASM',
    }
    self.postMessage(errorMsg)
  }
}

self.onmessage = (event: MessageEvent<WorkerInboundMessage>) => {
  const msg = event.data

  switch (msg.type) {
    case 'init':
      initStockfish()
      break

    case 'uci_command':
      if (stockfishReady && sfPostMessage) {
        sfPostMessage(msg.payload)
      } else {
        pendingCommands.push(msg.payload)
      }
      break

    case 'terminate':
      if (sfPostMessage) sfPostMessage('quit')
      self.close()
      break
  }
}
