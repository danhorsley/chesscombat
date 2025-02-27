// board-generator.ts
import { BoardPosition } from "./game-logic";

export const BOARD_SIZE = 5;

export interface BoardConfig {
  blackKingPosition: BoardPosition;
  missingSquares: BoardPosition[];
  startingSquare: BoardPosition;
  seed?: string; // Optional seed for reproducible boards
}

export function generateBoard(
  difficulty: "easy" | "medium" | "hard" = "medium",
  seed?: string,
): BoardConfig {
  // Use a seed if provided for reproducible boards
  const randomSeed = seed || Math.random().toString(36).substring(2, 15);
  const rng = seedRandom(randomSeed);

  // Determine number of missing squares based on difficulty
  const numMissingSquares =
    difficulty === "easy"
      ? randomInt(3, 5, rng)
      : difficulty === "medium"
        ? randomInt(5, 8, rng)
        : randomInt(8, 12, rng); // hard

  // Start with an empty set of missing squares
  const missingSquares: BoardPosition[] = [];

  // Generate random black king position (not in corner)
  const blackKingPosition = {
    x: randomInt(1, BOARD_SIZE - 2, rng),
    y: randomInt(1, BOARD_SIZE - 2, rng),
  };

  // Ensure valid king position by checking if it's not in a corner
  const validKingPosition = !isCornerPosition(blackKingPosition)
    ? blackKingPosition
    : { x: Math.floor(BOARD_SIZE / 2), y: Math.floor(BOARD_SIZE / 2) }; // Fallback to center

  // Generate random starting square (not where the king is, preferably in corner)
  const cornerPositions = [
    { x: 0, y: 0 },
    { x: 0, y: BOARD_SIZE - 1 },
    { x: BOARD_SIZE - 1, y: 0 },
    { x: BOARD_SIZE - 1, y: BOARD_SIZE - 1 },
  ];

  // Pick a random corner for the starting square with bounds protection
  const cornerIndex = randomInt(0, cornerPositions.length - 1, rng);
  // Add bounds protection to ensure cornerIndex is valid
  const safeCornerIndex = Math.min(
    Math.max(0, cornerIndex),
    cornerPositions.length - 1,
  );

  const startingSquare = cornerPositions[safeCornerIndex];

  // Generate missing squares
  for (let i = 0; i < numMissingSquares; i++) {
    let missingSquare: BoardPosition;
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loops

    do {
      missingSquare = {
        x: randomInt(0, BOARD_SIZE - 1, rng),
        y: randomInt(0, BOARD_SIZE - 1, rng),
      };
      attempts++;

      // Break if we've tried too many times to find a valid position
      if (attempts > maxAttempts) {
        break;
      }
    } while (
      // Don't overlap with king or starting square
      (missingSquare.x === validKingPosition.x &&
        missingSquare.y === validKingPosition.y) ||
      (missingSquare.x === startingSquare.x &&
        missingSquare.y === startingSquare.y) ||
      // Don't reuse squares
      missingSquares.some(
        (pos) => pos.x === missingSquare.x && pos.y === missingSquare.y,
      ) ||
      // For harder difficulties, don't place too many missing squares near the king
      (difficulty === "hard" &&
        manhattanDistance(missingSquare, validKingPosition) < 2)
    );

    // Only add the missing square if we found a valid position
    if (attempts <= maxAttempts) {
      missingSquares.push(missingSquare);
    }
  }

  return {
    blackKingPosition: validKingPosition,
    missingSquares,
    startingSquare,
    seed: randomSeed,
  };
}

// Helper functions for the board generator
function isCornerPosition(pos: BoardPosition): boolean {
  return (
    (pos.x === 0 && pos.y === 0) ||
    (pos.x === 0 && pos.y === BOARD_SIZE - 1) ||
    (pos.x === BOARD_SIZE - 1 && pos.y === 0) ||
    (pos.x === BOARD_SIZE - 1 && pos.y === BOARD_SIZE - 1)
  );
}

function manhattanDistance(pos1: BoardPosition, pos2: BoardPosition): number {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}

function randomInt(min: number, max: number, rng: () => number): number {
  // Add bounds checking to ensure min <= max
  if (min > max) {
    [min, max] = [max, min]; // Swap values if min > max
  }

  // Calculate a safe random integer
  const range = max - min + 1;
  const randomValue = Math.floor(rng() * range) + min;

  // Double check the bounds to ensure we return a valid value
  return Math.min(Math.max(min, randomValue), max);
}

// Simple seedable random number generator
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
