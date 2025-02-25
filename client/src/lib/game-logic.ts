// game-logic.ts - Core game mechanics

export type PieceType = "rook" | "bishop" | "knight" | "queen" | "king";
export type PieceColor = "blue" | "green" | "purple" | "red" | "black";

export interface GamePiece {
  id: string;
  type: PieceType;
  color: PieceColor;
  points: number;
  multiplier: number;
}

export interface BoardPosition {
  x: number;
  y: number;
}

export const BOARD_SIZE = 5;

export const isWithinBoard = (pos: BoardPosition) => {
  return pos.x >= 0 && pos.x < BOARD_SIZE && pos.y >= 0 && pos.y < BOARD_SIZE;
};

export const getPieceMovements = (
  piece: GamePiece,
  from: BoardPosition,
): BoardPosition[] => {
  const moves: BoardPosition[] = [];

  switch (piece.type) {
    case "rook":
      // Horizontal and vertical moves
      for (let i = 0; i < BOARD_SIZE; i++) {
        if (i !== from.x) moves.push({ x: i, y: from.y });
        if (i !== from.y) moves.push({ x: from.x, y: i });
      }
      break;

    case "bishop":
      // Diagonal moves
      for (let i = -BOARD_SIZE; i <= BOARD_SIZE; i++) {
        const pos1 = { x: from.x + i, y: from.y + i };
        const pos2 = { x: from.x + i, y: from.y - i };
        if (isWithinBoard(pos1) && i !== 0) moves.push(pos1);
        if (isWithinBoard(pos2) && i !== 0) moves.push(pos2);
      }
      break;

    case "knight":
      // L-shaped moves
      const knightMoves = [
        { x: 2, y: 1 },
        { x: 2, y: -1 },
        { x: -2, y: 1 },
        { x: -2, y: -1 },
        { x: 1, y: 2 },
        { x: 1, y: -2 },
        { x: -1, y: 2 },
        { x: -1, y: -2 },
      ];
      for (const move of knightMoves) {
        const newPos = {
          x: from.x + move.x,
          y: from.y + move.y,
        };
        if (isWithinBoard(newPos)) moves.push(newPos);
      }
      break;

    case "queen":
      // Combine rook and bishop moves
      const rookMoves = getPieceMovements({ ...piece, type: "rook" }, from);
      const bishopMoves = getPieceMovements({ ...piece, type: "bishop" }, from);
      moves.push(...rookMoves, ...bishopMoves);
      break;

    case "king":
      // One square in any direction
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;
          const newPos = { x: from.x + dx, y: from.y + dy };
          if (isWithinBoard(newPos)) moves.push(newPos);
        }
      }
      break;
  }

  return moves;
};

// Check if piece at 'from' can capture piece at 'to'
export const canCapture = (
  piece: GamePiece,
  from: BoardPosition,
  to: BoardPosition,
): boolean => {
  return getPieceMovements(piece, from).some(
    (move) => move.x === to.x && move.y === to.y,
  );
};

// Verify chain of captures
export const validateCaptureChain = (
  pieces: Map<string, GamePiece>,
  positions: BoardPosition[],
  blackKingPosition: BoardPosition,
): boolean => {
  if (positions.length < 2) return false;

  // Check each consecutive pair in the chain
  for (let i = 0; i < positions.length - 1; i++) {
    const currentPos = positions[i];
    const nextPos = positions[i + 1];
    const currentKey = `${currentPos.x},${currentPos.y}`;
    const currentPiece = pieces.get(currentKey);

    if (!currentPiece) return false;

    const nextKey = `${nextPos.x},${nextPos.y}`;
    const nextPiece =
      i === positions.length - 1
        ? {
            id: "black-king",
            type: "king",
            color: "black",
            points: 0,
            multiplier: 1,
          }
        : pieces.get(nextKey);

    if (!nextPiece) return false;

    if (!canCapture(currentPiece, currentPos, nextPos)) {
      return false;
    }
  }

  // Final piece should be able to capture the king
  const lastPos = positions[positions.length - 1];
  const lastKey = `${lastPos.x},${lastPos.y}`;
  const lastPiece = pieces.get(lastKey);

  return lastPiece ? canCapture(lastPiece, lastPos, blackKingPosition) : false;
};

export const AVAILABLE_PIECES: GamePiece[] = [
  // Rooks
  { id: "rook-blue", type: "rook", color: "blue", points: 50, multiplier: 1.2 },
  {
    id: "rook-green",
    type: "rook",
    color: "green",
    points: 45,
    multiplier: 1.3,
  },
  {
    id: "rook-purple",
    type: "rook",
    color: "purple",
    points: 55,
    multiplier: 1.1,
  },
  { id: "rook-red", type: "rook", color: "red", points: 60, multiplier: 1.0 },

  // Bishops
  {
    id: "bishop-blue",
    type: "bishop",
    color: "blue",
    points: 35,
    multiplier: 1.4,
  },
  {
    id: "bishop-green",
    type: "bishop",
    color: "green",
    points: 30,
    multiplier: 1.5,
  },
  {
    id: "bishop-purple",
    type: "bishop",
    color: "purple",
    points: 40,
    multiplier: 1.3,
  },
  {
    id: "bishop-red",
    type: "bishop",
    color: "red",
    points: 45,
    multiplier: 1.2,
  },

  // Knights
  {
    id: "knight-blue",
    type: "knight",
    color: "blue",
    points: 40,
    multiplier: 1.3,
  },
  {
    id: "knight-green",
    type: "knight",
    color: "green",
    points: 35,
    multiplier: 1.4,
  },
  {
    id: "knight-purple",
    type: "knight",
    color: "purple",
    points: 45,
    multiplier: 1.2,
  },
  {
    id: "knight-red",
    type: "knight",
    color: "red",
    points: 50,
    multiplier: 1.1,
  },

  // Queens
  {
    id: "queen-blue",
    type: "queen",
    color: "blue",
    points: 80,
    multiplier: 1.5,
  },
  {
    id: "queen-green",
    type: "queen",
    color: "green",
    points: 75,
    multiplier: 1.7,
  },
  {
    id: "queen-purple",
    type: "queen",
    color: "purple",
    points: 85,
    multiplier: 1.4,
  },
  { id: "queen-red", type: "queen", color: "red", points: 90, multiplier: 2.0 },

  // Kings (have lower points but higher multipliers)
  { id: "king-blue", type: "king", color: "blue", points: 20, multiplier: 2.0 },
  {
    id: "king-green",
    type: "king",
    color: "green",
    points: 15,
    multiplier: 2.5,
  },
  {
    id: "king-purple",
    type: "king",
    color: "purple",
    points: 25,
    multiplier: 1.8,
  },
  { id: "king-red", type: "king", color: "red", points: 30, multiplier: 1.5 },
];

export const calculateChainScore = (
  pieces: Map<string, GamePiece>,
  chain: BoardPosition[],
): { points: number; multiplierText: string } => {
  let totalPoints = 0;
  let currentMultiplier = 1;
  let multiplierText = "";

  chain.forEach((pos, index) => {
    const key = `${pos.x},${pos.y}`;
    const piece = pieces.get(key);

    if (piece) {
      // Calculate points from this piece
      const piecePoints = piece.points * currentMultiplier;
      totalPoints += piecePoints;

      // Update multiplier for next piece
      currentMultiplier *= piece.multiplier;

      // Build multiplier text to display
      if (index < chain.length - 1) {
        multiplierText += `${piece.multiplier}x `;
      } else {
        multiplierText += `${piece.multiplier}`;
      }
    }
  });

  return { points: Math.round(totalPoints), multiplierText };
};
