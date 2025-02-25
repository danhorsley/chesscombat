// piece-selector.ts
import { GamePiece, AVAILABLE_PIECES } from "./game-logic";
import { BoardConfig } from "./board-generator";

/**
 * Selects a random piece for each piece type with random colors
 */
export function selectRandomPieces(
  boardConfig: BoardConfig,
  seed?: string,
): GamePiece[] {
  // Use the board seed for deterministic piece selection if provided
  const seedValue =
    seed || boardConfig.seed || Math.random().toString(36).substring(2, 15);
  const rng = seedRandom(seedValue);

  const pieceTypes = ["rook", "bishop", "knight", "queen"];
  const selectedPieces: GamePiece[] = [];

  // Select one piece of each type with a random color
  pieceTypes.forEach((type) => {
    const piecesOfType = AVAILABLE_PIECES.filter(
      (piece) => piece.type === type,
    );
    const randomIndex = Math.floor(rng() * piecesOfType.length);
    selectedPieces.push(piecesOfType[randomIndex]);
  });

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
