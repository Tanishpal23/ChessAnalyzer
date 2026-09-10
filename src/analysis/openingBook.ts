/**
 * openingBook.ts — Opening theory database & identification for ChessAnalyzer.
 *
 * Maps opening move sequences to ECO codes and opening names,
 * and determines if a played move is an established "Book Move".
 */

export interface OpeningEntry {
  eco: string
  name: string
  moves: string[] // Array of UCI move strings
}

/**
 * Curated database of major chess opening lines and variations.
 */
export const OPENING_DATABASE: OpeningEntry[] = [
  // ─── 1. e4 Open Games (1. e4) ──────────────────────────────────────────
  { eco: 'B00', name: "King's Pawn Opening", moves: ['e2e4'] },
  { eco: 'C20', name: "King's Pawn Game", moves: ['e2e4', 'e7e5'] },
  { eco: 'C40', name: "King's Knight Opening", moves: ['e2e4', 'e7e5', 'g1f3'] },
  { eco: 'C41', name: 'Philidor Defense', moves: ['e2e4', 'e7e5', 'g1f3', 'd7d6'] },
  { eco: 'C41', name: 'Philidor Defense: Exchange', moves: ['e2e4', 'e7e5', 'g1f3', 'd7d6', 'd2d4', 'e5d4', 'f3d4'] },
  { eco: 'C42', name: 'Petrov Defense', moves: ['e2e4', 'e7e5', 'g1f3', 'g8f6'] },
  { eco: 'C42', name: 'Petrov Defense: Classical Attack', moves: ['e2e4', 'e7e5', 'g1f3', 'g8f6', 'f3e5', 'd7d6', 'e5f3', 'f6e4', 'd2d4', 'd6d5', 'f1d3'] },
  { eco: 'C43', name: 'Petrov Defense: Steinitz Attack', moves: ['e2e4', 'e7e5', 'g1f3', 'g8f6', 'd2d4', 'e5d4', 'e4e5'] },

  // Scotch Game
  { eco: 'C44', name: 'Scotch Game', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'd2d4'] },
  { eco: 'C45', name: 'Scotch Game: Classical', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'd2d4', 'e5d4', 'f3d4', 'f8c5'] },
  { eco: 'C45', name: 'Scotch Game: Mieses Variation', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'd2d4', 'e5d4', 'f3d4', 'g8f6', 'b1c3', 'f8b4'] },
  { eco: 'C44', name: 'Scotch Gambit', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'd2d4', 'e5d4', 'f1c4'] },

  // Four & Three Knights
  { eco: 'C46', name: 'Three Knights Opening', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'b1c3'] },
  { eco: 'C47', name: 'Four Knights Game', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'b1c3', 'g8f6'] },
  { eco: 'C48', name: 'Four Knights Game: Spanish Variation', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'b1c3', 'g8f6', 'f1b5'] },
  { eco: 'C47', name: 'Four Knights Game: Scotch Variation', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'b1c3', 'g8f6', 'd2d4'] },

  // Italian Game
  { eco: 'C50', name: 'Italian Game', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4'] },
  { eco: 'C50', name: 'Italian Game: Hungarian Defense', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4', 'f8e7'] },
  { eco: 'C50', name: 'Italian Game: Giuoco Piano', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4', 'f8c5'] },
  { eco: 'C51', name: 'Evans Gambit', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4', 'f8c5', 'b2b4'] },
  { eco: 'C52', name: 'Evans Gambit: Accepted', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4', 'f8c5', 'b2b4', 'c5b4', 'c2c3', 'b4a5', 'd2d4'] },
  { eco: 'C53', name: 'Italian Game: Giuoco Piano (c3)', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4', 'f8c5', 'c2c3'] },
  { eco: 'C54', name: 'Italian Game: Giuoco Pianissimo', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4', 'f8c5', 'c2c3', 'g8f6', 'd2d3'] },
  { eco: 'C54', name: 'Italian Game: Giuoco Pianissimo (Mainline)', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4', 'f8c5', 'c2c3', 'g8f6', 'd2d3', 'd7d6', 'e1g1'] },
  { eco: 'C50', name: 'Italian Game: Giuoco Pianissimo (4.d3)', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4', 'f8c5', 'd2d3', 'g8f6'] },
  { eco: 'C50', name: 'Italian Game: Giuoco Pianissimo (4.O-O)', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4', 'f8c5', 'e1g1', 'g8f6', 'd2d3'] },
  { eco: 'C54', name: 'Italian Game: Classical Mainline', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4', 'f8c5', 'c2c3', 'g8f6', 'd2d4', 'e5d4', 'c3d4', 'c5b4'] },
  { eco: 'C55', name: 'Two Knights Defense', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4', 'g8f6'] },
  { eco: 'C55', name: 'Two Knights Defense: Modern', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4', 'g8f6', 'd2d3'] },
  { eco: 'C57', name: 'Two Knights Defense: Fried Liver Attack', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4', 'g8f6', 'f3g5', 'd7d5', 'e4d5', 'f6d5', 'g5f7'] },
  { eco: 'C57', name: 'Two Knights Defense: Traxler Counterattack', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4', 'g8f6', 'f3g5', 'f8c5'] },

  // Ruy Lopez
  { eco: 'C60', name: 'Ruy Lopez', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1b5'] },
  { eco: 'C63', name: 'Ruy Lopez: Schliemann Defense', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1b5', 'f7f5'] },
  { eco: 'C65', name: 'Ruy Lopez: Berlin Defense', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1b5', 'g8f6'] },
  { eco: 'C67', name: 'Ruy Lopez: Berlin Defense Open', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1b5', 'g8f6', 'e1g1', 'f6e4', 'd2d4', 'e4d6', 'b5c6', 'd7c6', 'd4e5', 'd6f5'] },
  { eco: 'C68', name: 'Ruy Lopez: Exchange Variation', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1b5', 'a7a6', 'b5c6'] },
  { eco: 'C70', name: 'Ruy Lopez: Morphy Defense', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1b5', 'a7a6', 'b5a4'] },
  { eco: 'C77', name: 'Ruy Lopez: Morphy Closed', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1b5', 'a7a6', 'b5a4', 'g8f6', 'e1g1', 'f8e7'] },
  { eco: 'C78', name: 'Ruy Lopez: Closed', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1b5', 'a7a6', 'b5a4', 'g8f6', 'e1g1', 'f8e7', 'f1e1', 'b7b5', 'a4b3', 'd7d6', 'c2c3', 'e8g8'] },
  { eco: 'C88', name: 'Ruy Lopez: Closed Main Line', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1b5', 'a7a6', 'b5a4', 'g8f6', 'e1g1', 'f8e7', 'f1e1', 'b7b5', 'a4b3', 'd7d6', 'c2c3', 'e8g8', 'h2h3'] },
  { eco: 'C89', name: 'Ruy Lopez: Marshall Attack', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1b5', 'a7a6', 'b5a4', 'g8f6', 'e1g1', 'f8e7', 'f1e1', 'b7b5', 'a4b3', 'd7d6', 'c2c3', 'e8g8', 'h2h3', 'd6d5'] },
  { eco: 'C97', name: 'Ruy Lopez: Chigorin Variation', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1b5', 'a7a6', 'b5a4', 'g8f6', 'e1g1', 'f8e7', 'f1e1', 'b7b5', 'a4b3', 'd7d6', 'c2c3', 'e8g8', 'h2h3', 'c6a5', 'b3c2', 'c7c5', 'd2d4', 'd8c7'] },
  { eco: 'C80', name: 'Ruy Lopez: Open Variation', moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1b5', 'a7a6', 'b5a4', 'g8f6', 'e1g1', 'f6e4', 'd2d4', 'b7b5', 'a4b3', 'd7d5', 'd4e5', 'c8e6'] },

  // Other 1. e4 e5 Openings
  { eco: 'C23', name: "Bishop's Opening", moves: ['e2e4', 'e7e5', 'f1c4'] },
  { eco: 'C25', name: 'Vienna Game', moves: ['e2e4', 'e7e5', 'b1c3'] },
  { eco: 'C26', name: 'Vienna Game: Falkbeer Variation', moves: ['e2e4', 'e7e5', 'b1c3', 'g8f6'] },
  { eco: 'C29', name: 'Vienna Gambit', moves: ['e2e4', 'e7e5', 'b1c3', 'g8f6', 'f2f4'] },
  { eco: 'C30', name: "King's Gambit", moves: ['e2e4', 'e7e5', 'f2f4'] },
  { eco: 'C33', name: "King's Gambit Accepted", moves: ['e2e4', 'e7e5', 'f2f4', 'e5f4'] },
  { eco: 'C34', name: "King's Gambit Accepted: Modern", moves: ['e2e4', 'e7e5', 'f2f4', 'e5f4', 'g1f3'] },
  { eco: 'C30', name: "King's Gambit Declined", moves: ['e2e4', 'e7e5', 'f2f4', 'f8c5'] },
  { eco: 'C31', name: "King's Gambit: Falkbeer Countergambit", moves: ['e2e4', 'e7e5', 'f2f4', 'd7d5'] },
  { eco: 'C21', name: 'Center Game', moves: ['e2e4', 'e7e5', 'd2d4', 'e5d4'] },
  { eco: 'C21', name: 'Danish Gambit', moves: ['e2e4', 'e7e5', 'd2d4', 'e5d4', 'c2c3'] },

  // ─── Sicilian Defense (1. e4 c5) ──────────────────────────────────────────
  { eco: 'B20', name: 'Sicilian Defense', moves: ['e2e4', 'c7c5'] },
  { eco: 'B21', name: 'Sicilian Defense: Smith-Morra Gambit', moves: ['e2e4', 'c7c5', 'd2d4', 'c5d4', 'c2c3'] },
  { eco: 'B22', name: 'Sicilian Defense: Alapin Variation', moves: ['e2e4', 'c7c5', 'c2c3'] },
  { eco: 'B23', name: 'Sicilian Defense: Closed', moves: ['e2e4', 'c7c5', 'b1c3'] },
  { eco: 'B24', name: 'Sicilian Defense: Closed Mainline', moves: ['e2e4', 'c7c5', 'b1c3', 'b8c6', 'g2g3', 'g7g6', 'f1g2', 'f8g7', 'd2d3', 'd7d6'] },
  { eco: 'B23', name: 'Sicilian Defense: Grand Prix Attack', moves: ['e2e4', 'c7c5', 'b1c3', 'b8c6', 'f2f4'] },
  { eco: 'B30', name: 'Sicilian Defense: Old Sicilian', moves: ['e2e4', 'c7c5', 'g1f3', 'b8c6'] },
  { eco: 'B31', name: 'Sicilian Defense: Rossolimo Attack', moves: ['e2e4', 'c7c5', 'g1f3', 'b8c6', 'f1b5'] },
  { eco: 'B32', name: 'Sicilian Defense: Open', moves: ['e2e4', 'c7c5', 'g1f3', 'b8c6', 'd2d4', 'c5d4', 'f3d4'] },
  { eco: 'B33', name: 'Sicilian Defense: Sveshnikov Variation', moves: ['e2e4', 'c7c5', 'g1f3', 'b8c6', 'd2d4', 'c5d4', 'f3d4', 'g8f6', 'b1c3', 'e7e5', 'd4b5', 'd7d6'] },
  { eco: 'B32', name: 'Sicilian Defense: Kalashnikov Variation', moves: ['e2e4', 'c7c5', 'g1f3', 'b8c6', 'd2d4', 'c5d4', 'f3d4', 'e7e5', 'd4b5', 'd7d6'] },
  { eco: 'B34', name: 'Sicilian Defense: Accelerated Dragon', moves: ['e2e4', 'c7c5', 'g1f3', 'b8c6', 'd2d4', 'c5d4', 'f3d4', 'g7g6'] },
  { eco: 'B40', name: 'Sicilian Defense: French Variation', moves: ['e2e4', 'c7c5', 'g1f3', 'e7e6'] },
  { eco: 'B41', name: 'Sicilian Defense: Kan Variation', moves: ['e2e4', 'c7c5', 'g1f3', 'e7e6', 'd2d4', 'c5d4', 'f3d4', 'a7a6'] },
  { eco: 'B44', name: 'Sicilian Defense: Taimanov Variation', moves: ['e2e4', 'c7c5', 'g1f3', 'e7e6', 'd2d4', 'c5d4', 'f3d4', 'b8c6', 'b1c3', 'a7a6'] },
  { eco: 'B45', name: 'Sicilian Defense: Four Knights', moves: ['e2e4', 'c7c5', 'g1f3', 'e7e6', 'd2d4', 'c5d4', 'f3d4', 'g8f6', 'b1c3', 'b8c6'] },
  { eco: 'B50', name: 'Sicilian Defense: Modern Variations', moves: ['e2e4', 'c7c5', 'g1f3', 'd7d6'] },
  { eco: 'B51', name: 'Sicilian Defense: Moscow Variation', moves: ['e2e4', 'c7c5', 'g1f3', 'd7d6', 'f1b5'] },
  { eco: 'B54', name: 'Sicilian Defense: Classical', moves: ['e2e4', 'c7c5', 'g1f3', 'd7d6', 'd2d4', 'c5d4', 'f3d4', 'g8f6', 'b1c3', 'b8c6'] },
  { eco: 'B70', name: 'Sicilian Defense: Dragon Variation', moves: ['e2e4', 'c7c5', 'g1f3', 'd7d6', 'd2d4', 'c5d4', 'f3d4', 'g8f6', 'b1c3', 'g7g6'] },
  { eco: 'B75', name: 'Sicilian Defense: Dragon (Yugoslav Attack)', moves: ['e2e4', 'c7c5', 'g1f3', 'd7d6', 'd2d4', 'c5d4', 'f3d4', 'g8f6', 'b1c3', 'g7g6', 'c1e3', 'f8g7', 'f2f3', 'e8g8', 'd1d2', 'b8c6'] },
  { eco: 'B80', name: 'Sicilian Defense: Scheveningen Variation', moves: ['e2e4', 'c7c5', 'g1f3', 'd7d6', 'd2d4', 'c5d4', 'f3d4', 'g8f6', 'b1c3', 'e7e6'] },
  { eco: 'B90', name: 'Sicilian Defense: Najdorf Variation', moves: ['e2e4', 'c7c5', 'g1f3', 'd7d6', 'd2d4', 'c5d4', 'f3d4', 'g8f6', 'b1c3', 'a7a6'] },
  { eco: 'B90', name: 'Sicilian Defense: Najdorf (English Attack)', moves: ['e2e4', 'c7c5', 'g1f3', 'd7d6', 'd2d4', 'c5d4', 'f3d4', 'g8f6', 'b1c3', 'a7a6', 'c1e3', 'e7e5', 'd4b3', 'c8e6', 'f2f3'] },
  { eco: 'B92', name: 'Sicilian Defense: Najdorf (Classical 6.Be2)', moves: ['e2e4', 'c7c5', 'g1f3', 'd7d6', 'd2d4', 'c5d4', 'f3d4', 'g8f6', 'b1c3', 'a7a6', 'f1e2', 'e7e5', 'd4b3'] },
  { eco: 'B94', name: 'Sicilian Defense: Najdorf (6.Bg5)', moves: ['e2e4', 'c7c5', 'g1f3', 'd7d6', 'd2d4', 'c5d4', 'f3d4', 'g8f6', 'b1c3', 'a7a6', 'c1g5', 'e7e6', 'f2f4'] },

  // ─── French Defense (1. e4 e6) ────────────────────────────────────────────
  { eco: 'C00', name: 'French Defense', moves: ['e2e4', 'e7e6'] },
  { eco: 'C01', name: 'French Defense: Exchange Variation', moves: ['e2e4', 'e7e6', 'd2d4', 'd7d5', 'e4d5', 'e6d5'] },
  { eco: 'C02', name: 'French Defense: Advance Variation', moves: ['e2e4', 'e7e6', 'd2d4', 'd7d5', 'e4e5'] },
  { eco: 'C02', name: 'French Defense: Advance Mainline', moves: ['e2e4', 'e7e6', 'd2d4', 'd7d5', 'e4e5', 'c7c5', 'c2c3', 'b8c6', 'g1f3', 'd8b6'] },
  { eco: 'C03', name: 'French Defense: Tarrasch Variation', moves: ['e2e4', 'e7e6', 'd2d4', 'd7d5', 'b1d2'] },
  { eco: 'C05', name: 'French Defense: Tarrasch Closed', moves: ['e2e4', 'e7e6', 'd2d4', 'd7d5', 'b1d2', 'g8f6', 'e4e5', 'f6d7', 'f1d3', 'c7c5', 'c2c3'] },
  { eco: 'C10', name: 'French Defense: Paulsen Variation', moves: ['e2e4', 'e7e6', 'd2d4', 'd7d5', 'b1c3'] },
  { eco: 'C10', name: 'French Defense: Rubinstein Variation', moves: ['e2e4', 'e7e6', 'd2d4', 'd7d5', 'b1c3', 'd5e4', 'c3e4'] },
  { eco: 'C11', name: 'French Defense: Classical', moves: ['e2e4', 'e7e6', 'd2d4', 'd7d5', 'b1c3', 'g8f6'] },
  { eco: 'C11', name: 'French Defense: Classical Steinitz', moves: ['e2e4', 'e7e6', 'd2d4', 'd7d5', 'b1c3', 'g8f6', 'e4e5', 'f6d7', 'f2f4', 'c7c5', 'g1f3', 'b8c6'] },
  { eco: 'C15', name: 'French Defense: Winawer Variation', moves: ['e2e4', 'e7e6', 'd2d4', 'd7d5', 'b1c3', 'f8b4'] },
  { eco: 'C18', name: 'French Defense: Winawer Advance', moves: ['e2e4', 'e7e6', 'd2d4', 'd7d5', 'b1c3', 'f8b4', 'e4e5', 'c7c5', 'a2a3', 'b4c3', 'b2c3', 'g8e7'] },

  // ─── Caro-Kann Defense (1. e4 c6) ─────────────────────────────────────────
  { eco: 'B10', name: 'Caro-Kann Defense', moves: ['e2e4', 'c7c6'] },
  { eco: 'B11', name: 'Caro-Kann Defense: Two Knights', moves: ['e2e4', 'c7c6', 'b1c3', 'd7d5', 'g1f3'] },
  { eco: 'B12', name: 'Caro-Kann Defense: Advance Variation', moves: ['e2e4', 'c7c6', 'd2d4', 'd7d5', 'e4e5'] },
  { eco: 'B12', name: 'Caro-Kann Defense: Advance (Short System)', moves: ['e2e4', 'c7c6', 'd2d4', 'd7d5', 'e4e5', 'c8f5', 'g1f3', 'e7e6', 'f1e2', 'c6c5'] },
  { eco: 'B13', name: 'Caro-Kann Defense: Exchange Variation', moves: ['e2e4', 'c7c6', 'd2d4', 'd7d5', 'e4d5', 'c6d5'] },
  { eco: 'B14', name: 'Caro-Kann Defense: Panov-Botvinnik Attack', moves: ['e2e4', 'c7c6', 'd2d4', 'd7d5', 'e4d5', 'c6d5', 'c2c4', 'g8f6', 'b1c3'] },
  { eco: 'B18', name: 'Caro-Kann Defense: Classical Variation', moves: ['e2e4', 'c7c6', 'd2d4', 'd7d5', 'b1c3', 'd5e4', 'c3e4', 'c8f5'] },
  { eco: 'B19', name: 'Caro-Kann Defense: Classical Mainline', moves: ['e2e4', 'c7c6', 'd2d4', 'd7d5', 'b1c3', 'd5e4', 'c3e4', 'c8f5', 'e4g3', 'f5g6', 'h2h4', 'h7h6', 'g1f3', 'b8d7'] },

  // ─── Other 1. e4 Defenses ────────────────────────────────────────────────
  { eco: 'B01', name: 'Scandinavian Defense', moves: ['e2e4', 'd7d5'] },
  { eco: 'B01', name: 'Scandinavian Defense: Mieses-Kotroc', moves: ['e2e4', 'd7d5', 'e4d5', 'd8d5', 'b1c3', 'd5a5'] },
  { eco: 'B01', name: 'Scandinavian Defense: Mainline', moves: ['e2e4', 'd7d5', 'e4d5', 'd8d5', 'b1c3', 'd5a5', 'd2d4', 'g8f6', 'g1f3', 'c7c6'] },
  { eco: 'B01', name: 'Scandinavian Defense: Modern (2...Nf6)', moves: ['e2e4', 'd7d5', 'e4d5', 'g8f6'] },
  { eco: 'B02', name: 'Alekhine Defense', moves: ['e2e4', 'g8f6'] },
  { eco: 'B03', name: 'Alekhine Defense: Four Pawns Attack', moves: ['e2e4', 'g8f6', 'e4e5', 'f6d5', 'd2d4', 'd7d6', 'c2c4', 'd5b6', 'f2f4'] },
  { eco: 'B04', name: 'Alekhine Defense: Modern Variation', moves: ['e2e4', 'g8f6', 'e4e5', 'f6d5', 'd2d4', 'd7d6', 'g1f3'] },
  { eco: 'B07', name: 'Pirc Defense', moves: ['e2e4', 'd7d6', 'd2d4', 'g8f6', 'b1c3', 'g7g6'] },
  { eco: 'B09', name: 'Pirc Defense: Austrian Attack', moves: ['e2e4', 'd7d6', 'd2d4', 'g8f6', 'b1c3', 'g7g6', 'f2f4', 'f8g7', 'g1f3', 'e8g8'] },
  { eco: 'B06', name: 'Modern Defense', moves: ['e2e4', 'g7g6'] },
  { eco: 'B00', name: 'Nimzowitsch Defense', moves: ['e2e4', 'b8c6'] },

  // ─── 1. d4 Openings ───────────────────────────────────────────────────────
  { eco: 'A40', name: "Queen's Pawn Opening", moves: ['d2d4'] },
  { eco: 'D00', name: "Queen's Pawn Game", moves: ['d2d4', 'd7d5'] },
  { eco: 'D02', name: 'London System', moves: ['d2d4', 'd7d5', 'g1f3', 'g8f6', 'c1f4'] },
  { eco: 'D02', name: 'London System (Early Bf4)', moves: ['d2d4', 'd7d5', 'c1f4'] },
  { eco: 'D02', name: 'London System: Mainline', moves: ['d2d4', 'd7d5', 'g1f3', 'g8f6', 'c1f4', 'e7e6', 'e2e3', 'c7c5', 'c2c3', 'b8c6', 'b1d2'] },
  { eco: 'D00', name: 'Jobava London System', moves: ['d2d4', 'd7d5', 'b1c3', 'g8f6', 'c1f4'] },
  { eco: 'A45', name: 'London System vs Indian', moves: ['d2d4', 'g8f6', 'c1f4'] },
  { eco: 'A45', name: 'London System: Indian Setup', moves: ['d2d4', 'g8f6', 'g1f3', 'e7e6', 'c1f4'] },
  { eco: 'A45', name: 'Trompowsky Attack', moves: ['d2d4', 'g8f6', 'c1g5'] },
  { eco: 'A46', name: 'Torre Attack', moves: ['d2d4', 'g8f6', 'g1f3', 'e7e6', 'c1g5'] },
  { eco: 'D05', name: 'Colle System', moves: ['d2d4', 'd7d5', 'g1f3', 'g8f6', 'e2e3', 'e7e6', 'f1d3', 'c7c5', 'c2c3'] },

  // Queen's Gambit
  { eco: 'D06', name: "Queen's Gambit", moves: ['d2d4', 'd7d5', 'c2c4'] },
  { eco: 'D20', name: "Queen's Gambit Accepted", moves: ['d2d4', 'd7d5', 'c2c4', 'd5c4'] },
  { eco: 'D27', name: "Queen's Gambit Accepted: Classical", moves: ['d2d4', 'd7d5', 'c2c4', 'd5c4', 'g1f3', 'g8f6', 'e2e3', 'e7e6', 'f1c4', 'c7c5', 'e1g1', 'a7a6'] },
  { eco: 'D30', name: "Queen's Gambit Declined", moves: ['d2d4', 'd7d5', 'c2c4', 'e7e6'] },
  { eco: 'D35', name: "Queen's Gambit Declined: Exchange", moves: ['d2d4', 'd7d5', 'c2c4', 'e7e6', 'b1c3', 'g8f6', 'c4d5', 'e6d5'] },
  { eco: 'D36', name: "Queen's Gambit Declined: Exchange Mainline", moves: ['d2d4', 'd7d5', 'c2c4', 'e7e6', 'b1c3', 'g8f6', 'c4d5', 'e6d5', 'c1g5', 'c7c6', 'd1c2', 'f8e7', 'e2e3'] },
  { eco: 'D37', name: "Queen's Gambit Declined: 4.Nf3", moves: ['d2d4', 'd7d5', 'c2c4', 'e7e6', 'b1c3', 'g8f6', 'g1f3', 'f8e7', 'c1f4', 'e8g8', 'e2e3'] },
  { eco: 'D55', name: "Queen's Gambit Declined: Orthodox", moves: ['d2d4', 'd7d5', 'c2c4', 'e7e6', 'b1c3', 'g8f6', 'c1g5', 'f8e7', 'e2e3', 'e8g8', 'g1f3', 'b8d7'] },
  { eco: 'D58', name: "Queen's Gambit Declined: Tartakower", moves: ['d2d4', 'd7d5', 'c2c4', 'e7e6', 'b1c3', 'g8f6', 'c1g5', 'f8e7', 'e2e3', 'e8g8', 'g1f3', 'h7h6', 'g5h4', 'b7b6'] },
  { eco: 'D51', name: "Queen's Gambit Declined: Cambridge Springs", moves: ['d2d4', 'd7d5', 'c2c4', 'e7e6', 'b1c3', 'g8f6', 'c1g5', 'b8d7', 'e2e3', 'c7c6', 'g1f3', 'd8a5'] },

  // Slav & Semi-Slav
  { eco: 'D10', name: 'Slav Defense', moves: ['d2d4', 'd7d5', 'c2c4', 'c7c6'] },
  { eco: 'D11', name: 'Slav Defense: 3.Nf3', moves: ['d2d4', 'd7d5', 'c2c4', 'c7c6', 'g1f3', 'g8f6'] },
  { eco: 'D15', name: 'Slav Defense: Three Knights', moves: ['d2d4', 'd7d5', 'c2c4', 'c7c6', 'g1f3', 'g8f6', 'b1c3'] },
  { eco: 'D17', name: 'Slav Defense: Czech Mainline', moves: ['d2d4', 'd7d5', 'c2c4', 'c7c6', 'g1f3', 'g8f6', 'b1c3', 'd5c4', 'a2a4', 'c8f5', 'e2e3', 'e7e6', 'f1c4', 'f8b4', 'e1g1'] },
  { eco: 'D15', name: 'Slav Defense: Chebanenko Variation', moves: ['d2d4', 'd7d5', 'c2c4', 'c7c6', 'g1f3', 'g8f6', 'b1c3', 'a7a6'] },
  { eco: 'D43', name: 'Semi-Slav Defense', moves: ['d2d4', 'd7d5', 'c2c4', 'c7c6', 'g1f3', 'g8f6', 'b1c3', 'e7e6'] },
  { eco: 'D45', name: 'Semi-Slav Defense: Meran Variation', moves: ['d2d4', 'd7d5', 'c2c4', 'c7c6', 'g1f3', 'g8f6', 'b1c3', 'e7e6', 'e2e3', 'b8d7', 'f1d3', 'd5c4', 'd3c4', 'b7b5', 'c4d3'] },
  { eco: 'D43', name: 'Semi-Slav Defense: Moscow Variation', moves: ['d2d4', 'd7d5', 'c2c4', 'c7c6', 'g1f3', 'g8f6', 'b1c3', 'e7e6', 'c1g5', 'h7h6', 'g5f6', 'd8f6'] },
  { eco: 'D44', name: 'Semi-Slav Defense: Botvinnik System', moves: ['d2d4', 'd7d5', 'c2c4', 'c7c6', 'g1f3', 'g8f6', 'b1c3', 'e7e6', 'c1g5', 'd5c4', 'e2e4', 'b7b5'] },

  // Catalan Opening
  { eco: 'E00', name: 'Catalan Opening', moves: ['d2d4', 'g8f6', 'c2c4', 'e7e6', 'g2g3'] },
  { eco: 'E01', name: 'Catalan Opening: Closed', moves: ['d2d4', 'g8f6', 'c2c4', 'e7e6', 'g2g3', 'd7d5', 'f1g2', 'f8e7', 'g1f3', 'e8g8', 'e1g1'] },
  { eco: 'E04', name: 'Catalan Opening: Open', moves: ['d2d4', 'g8f6', 'c2c4', 'e7e6', 'g2g3', 'd7d5', 'f1g2', 'd5c4', 'g1f3'] },

  // Indian Defenses (1. d4 Nf6)
  { eco: 'A45', name: 'Indian Defense', moves: ['d2d4', 'g8f6'] },
  { eco: 'E60', name: "King's Indian Defense", moves: ['d2d4', 'g8f6', 'c2c4', 'g7g6'] },
  { eco: 'E61', name: "King's Indian Defense: 3.Nc3", moves: ['d2d4', 'g8f6', 'c2c4', 'g7g6', 'b1c3', 'f8g7'] },
  { eco: 'E62', name: "King's Indian Defense: Fianchetto", moves: ['d2d4', 'g8f6', 'c2c4', 'g7g6', 'g2g3', 'f8g7', 'f1g2', 'e8g8', 'g1f3', 'd7d6'] },
  { eco: 'E70', name: "King's Indian Defense: Classical Setup", moves: ['d2d4', 'g8f6', 'c2c4', 'g7g6', 'b1c3', 'f8g7', 'e2e4', 'd7d6', 'g1f3', 'e8g8', 'f1e2', 'e7e5'] },
  { eco: 'E97', name: "King's Indian Defense: Mar del Plata", moves: ['d2d4', 'g8f6', 'c2c4', 'g7g6', 'b1c3', 'f8g7', 'e2e4', 'd7d6', 'g1f3', 'e8g8', 'f1e2', 'e7e5', 'e1g1', 'b8c6', 'd4d5', 'c6e7', 'f3e1', 'f6d7', 'c1e3', 'f7f5'] },
  { eco: 'E80', name: "King's Indian Defense: Sämisch Variation", moves: ['d2d4', 'g8f6', 'c2c4', 'g7g6', 'b1c3', 'f8g7', 'e2e4', 'd7d6', 'f2f3', 'e8g8', 'c1e3'] },

  // Grünfeld Defense
  { eco: 'D80', name: 'Grünfeld Defense', moves: ['d2d4', 'g8f6', 'c2c4', 'g7g6', 'b1c3', 'd7d5'] },
  { eco: 'D85', name: 'Grünfeld Defense: Exchange Variation', moves: ['d2d4', 'g8f6', 'c2c4', 'g7g6', 'b1c3', 'd7d5', 'c4d5', 'f6d5', 'e2e4', 'd5c3', 'b2c3', 'f8g7'] },
  { eco: 'D86', name: 'Grünfeld Defense: Exchange (Classical)', moves: ['d2d4', 'g8f6', 'c2c4', 'g7g6', 'b1c3', 'd7d5', 'c4d5', 'f6d5', 'e2e4', 'd5c3', 'b2c3', 'f8g7', 'f1c4', 'c7c5', 'g1e2', 'e8g8', 'e1g1'] },
  { eco: 'D90', name: 'Grünfeld Defense: Russian System', moves: ['d2d4', 'g8f6', 'c2c4', 'g7g6', 'b1c3', 'd7d5', 'g1f3', 'f8g7', 'd1b3', 'd5c4', 'b3c4', 'e8g8'] },

  // Nimzo-Indian & Queen's Indian
  { eco: 'E20', name: 'Nimzo-Indian Defense', moves: ['d2d4', 'g8f6', 'c2c4', 'e7e6', 'b1c3', 'f8b4'] },
  { eco: 'E32', name: 'Nimzo-Indian Defense: Classical', moves: ['d2d4', 'g8f6', 'c2c4', 'e7e6', 'b1c3', 'f8b4', 'd1c2', 'e8g8', 'a2a3', 'b4c3', 'c2c3'] },
  { eco: 'E40', name: 'Nimzo-Indian Defense: Rubinstein System', moves: ['d2d4', 'g8f6', 'c2c4', 'e7e6', 'b1c3', 'f8b4', 'e2e3', 'e8g8', 'f1d3', 'd7d5', 'g1f3', 'c7c5', 'e1g1'] },
  { eco: 'E12', name: "Queen's Indian Defense", moves: ['d2d4', 'g8f6', 'c2c4', 'e7e6', 'g1f3', 'b7b6'] },
  { eco: 'E15', name: "Queen's Indian Defense: Fianchetto", moves: ['d2d4', 'g8f6', 'c2c4', 'e7e6', 'g1f3', 'b7b6', 'g2g3', 'c8a6', 'b2b3', 'f8b4'] },
  { eco: 'E11', name: 'Bogo-Indian Defense', moves: ['d2d4', 'g8f6', 'c2c4', 'e7e6', 'g1f3', 'f8b4'] },

  // Benoni, Benko & Dutch
  { eco: 'A56', name: 'Benoni Defense', moves: ['d2d4', 'g8f6', 'c2c4', 'c7c5'] },
  { eco: 'A60', name: 'Modern Benoni', moves: ['d2d4', 'g8f6', 'c2c4', 'c7c5', 'd4d5', 'e7e6', 'b1c3', 'e6d5', 'c4d5', 'd7d6', 'e2e4', 'g7g6'] },
  { eco: 'A57', name: 'Benko Gambit', moves: ['d2d4', 'g8f6', 'c2c4', 'c7c5', 'd4d5', 'b7b5'] },
  { eco: 'A58', name: 'Benko Gambit: Accepted', moves: ['d2d4', 'g8f6', 'c2c4', 'c7c5', 'd4d5', 'b7b5', 'c4b5', 'a7a6', 'b5a6', 'c8a6', 'b1c3', 'd7d6'] },
  { eco: 'A80', name: 'Dutch Defense', moves: ['d2d4', 'f7f5'] },
  { eco: 'A87', name: 'Dutch Defense: Leningrad', moves: ['d2d4', 'f7f5', 'c2c4', 'g8f6', 'g2g3', 'g7g6', 'f1g2', 'f8g7', 'g1f3', 'e8g8', 'e1g1', 'd7d6'] },
  { eco: 'A90', name: 'Dutch Defense: Stonewall', moves: ['d2d4', 'f7f5', 'c2c4', 'e7e6', 'g2g3', 'g8f6', 'f1g2', 'd7d5', 'g1f3', 'c7c6', 'e1g1', 'f8d6'] },

  // ─── Flank Openings ────────────────────────────────────────────────────────
  { eco: 'A10', name: 'English Opening', moves: ['c2c4'] },
  { eco: 'A15', name: 'English Opening: Anglo-Indian', moves: ['c2c4', 'g8f6'] },
  { eco: 'A17', name: 'English Opening: Anglo-Indian (2.Nc3)', moves: ['c2c4', 'g8f6', 'b1c3', 'e7e6', 'g1f3', 'b7b6'] },
  { eco: 'A20', name: "English Opening: King's English", moves: ['c2c4', 'e7e5'] },
  { eco: 'A25', name: "English Opening: King's English (Closed)", moves: ['c2c4', 'e7e5', 'b1c3', 'b8c6', 'g2g3', 'g7g6', 'f1g2', 'f8g7', 'd2d3', 'd7d6'] },
  { eco: 'A28', name: "English Opening: Four Knights", moves: ['c2c4', 'e7e5', 'b1c3', 'g8f6', 'g1f3', 'b8c6'] },
  { eco: 'A30', name: 'English Opening: Symmetrical', moves: ['c2c4', 'c7c5'] },
  { eco: 'A34', name: 'English Opening: Symmetrical (Three Knights)', moves: ['c2c4', 'c7c5', 'b1c3', 'g8f6', 'g1f3', 'd7d5', 'c4d5', 'f6d5'] },
  { eco: 'A04', name: 'Réti Opening', moves: ['g1f3'] },
  { eco: 'A05', name: 'Réti Opening: King\'s Indian Attack', moves: ['g1f3', 'g8f6', 'g2g3'] },
  { eco: 'A07', name: "King's Indian Attack: Setup", moves: ['g1f3', 'd7d5', 'g2g3', 'g8f6', 'f1g2', 'e7e6', 'e1g1', 'f8e7', 'd2d3', 'e8g8', 'b1d2'] },
  { eco: 'A02', name: "Bird's Opening", moves: ['f2f4'] },
]

/**
 * Pre-computed Set of all valid opening move prefixes.
 * Enables O(1) instantaneous lookup to check if a played prefix is book theory.
 */
const BOOK_PREFIX_SET = new Set<string>()

// Populate prefix set on module load
for (const entry of OPENING_DATABASE) {
  let key = ''
  for (let i = 0; i < entry.moves.length; i++) {
    key = i === 0 ? entry.moves[i] : `${key},${entry.moves[i]}`
    BOOK_PREFIX_SET.add(key)
  }
}

/**
 * Identify opening name and ECO code from played moves history.
 * Searches for the longest matching sequence of moves in the database.
 */
export function identifyOpening(
  moves: Array<{ uci: string }>
): { name: string; eco: string } | null {
  if (moves.length === 0) return null

  const moveUcis = moves.map((m) => m.uci)
  let bestMatch: OpeningEntry | null = null
  let maxMatchedMoves = 0

  for (const entry of OPENING_DATABASE) {
    if (entry.moves.length > moveUcis.length) continue

    let matches = true
    for (let i = 0; i < entry.moves.length; i++) {
      if (entry.moves[i] !== moveUcis[i]) {
        matches = false
        break
      }
    }

    if (matches && entry.moves.length > maxMatchedMoves) {
      bestMatch = entry
      maxMatchedMoves = entry.moves.length
    }
  }

  return bestMatch ? { name: bestMatch.name, eco: bestMatch.eco } : null
}

/**
 * Check if move at `moveIndex` matches any recognized opening line in the database.
 * Uses the pre-computed prefix index for O(1) lookup.
 *
 * @param playedMoves - Sequence of moves played up to and including this move.
 * @param moveIndex - 0-indexed ply in the game.
 * @returns boolean true if this move continues a known opening line.
 */
export function isOpeningBookMove(
  playedMoves: Array<{ uci: string }>,
  moveIndex: number
): boolean {
  // Support up to 24 plies (12 full moves) of opening theory
  if (moveIndex >= 24 || playedMoves.length <= moveIndex) return false

  const prefixKey = playedMoves
    .slice(0, moveIndex + 1)
    .map((m) => m.uci)
    .join(',')

  return BOOK_PREFIX_SET.has(prefixKey)
}

