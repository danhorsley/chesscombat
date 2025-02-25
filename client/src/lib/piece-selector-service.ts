// client/src/lib/piece-selector-service.ts
import { GamePiece, AVAILABLE_PIECES } from "./game-logic";
import { BoardConfig } from "./board-generator";

export interface LevelPiecesConfig {
  id: string;
  name: string;
  pieces: string[]; // Array of piece IDs
}

// Predefined levels with specific piece configurations
export const PREDEFINED_LEVELS: LevelPiecesConfig[] = [
  {
    id: "basic",
    name: "Basic",
    pieces: ["rook-blue", "bishop-green", "knight-purple", "queen-red"],
  },
  {
    id: "multiplier-focus",
    name: "Multiplier Focus",
    pieces: ["rook-red", "bishop-purple", "knight-green", "queen-blue"],
  },
  {
    id: "queen-power",
    name: "Queen Power",
    pieces: ["queen-blue", "queen-green", "queen-purple", "queen-red"],
  },
  {
    id: "knight-challenge",
    name: "Knight Challenge",
    pieces: ["knight-blue", "knight-green", "knight-purple", "knight-red"],
  },
];

/**
 * Selects exactly four pieces - either from a predefined level or randomly
 * @param boardConfig Board configuration
 * @param levelId Optional level ID for predefined piece selection
 * @param seed Optional seed for random selection
 * @returns Array of exactly 4 GamePiece objects
 */
export function selectPieces(
  boardConfig: BoardConfig,
  levelId?: string,
  seed?: string,
): GamePiece[] {
  // If a level ID is provided, use the predefined pieces for that level
  if (levelId) {
    const level = PREDEFINED_LEVELS.find((l) => l.id === levelId);
    if (level) {
      return level.pieces
        .map((pieceId) => AVAILABLE_PIECES.find((p) => p.id === pieceId))
        .filter((piece): piece is GamePiece => piece !== undefined);
    }
  }

  // Otherwise, select 4 random pieces
  return selectRandomPieces(boardConfig, seed);
}

/**
 * Selects exactly four random pieces with a good distribution of types and colors
 */
function selectRandomPieces(
  boardConfig: BoardConfig,
  seed?: string,
): GamePiece[] {
  // Use the board seed for deterministic piece selection if provided
  const seedValue =
    seed || boardConfig.seed || Math.random().toString(36).substring(2, 15);
  const rng = seedRandom(seedValue);

  const selectedPieces: GamePiece[] = [];
  const usedTypes = new Set<string>();
  const usedColors = new Set<string>();

  // Try to select pieces with different types and colors when possible
  while (selectedPieces.length < 4) {
    // Create a pool of eligible pieces
    const eligiblePieces = AVAILABLE_PIECES.filter((piece) => {
      // For the first two pieces, prioritize different types
      if (selectedPieces.length < 2) {
        return !usedTypes.has(piece.type);
      }
      // For the next two pieces, try to get different colors if possible
      if (selectedPieces.length < 4) {
        return !usedColors.has(piece.color);
      }
      return true;
    });

    // If we can't find eligible pieces with our criteria, just use any remaining pieces
    const piecePool =
      eligiblePieces.length > 0 ? eligiblePieces : AVAILABLE_PIECES;

    // Select a random piece from the pool
    const randomIndex = Math.floor(rng() * piecePool.length);
    const selectedPiece = piecePool[randomIndex];

    // Make sure we haven't already selected this exact piece
    if (!selectedPieces.some((p) => p.id === selectedPiece.id)) {
      selectedPieces.push(selectedPiece);
      usedTypes.add(selectedPiece.type);
      usedColors.add(selectedPiece.color);
    }

    // Safety break to prevent potential infinite loops
    if (selectedPieces.length === 4) break;
  }

  return selectedPieces;
}

// Simple seedable random number generator (same as in board-generator.ts)
function seedRandom(seed: string): () => number {
  // Ensure we have a non-empty seed
  if (!seed || seed.length === 0) {
    seed = Math.random().toString(36).substring(2, 15);
  }

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return function () {
    // Simple multiplicative congruential generator
    hash = (hash * 16807) % 2147483647;
    // Ensure we always return a number between 0 and 1
    return Math.max(0, Math.min(1, (hash - 1) / 2147483646));
  };
}
