export type PieceType = 'rook' | 'bishop' | 'knight' | 'queen' | 'king';
export type PieceColor = 'blue' | 'green' | 'purple' | 'red' | 'black';

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

const isWithinBoard = (pos: BoardPosition) => {
  return pos.x >= 0 && pos.x < BOARD_SIZE && pos.y >= 0 && pos.y < BOARD_SIZE;
};

export const getPieceMovements = (piece: GamePiece, from: BoardPosition): BoardPosition[] => {
  const moves: BoardPosition[] = [];
  
  switch (piece.type) {
    case 'rook':
      // Horizontal and vertical moves
      for (let i = 0; i < BOARD_SIZE; i++) {
        if (i !== from.x) moves.push({ x: i, y: from.y });
        if (i !== from.y) moves.push({ x: from.x, y: i });
      }
      break;
      
    case 'bishop':
      // Diagonal moves
      for (let i = -BOARD_SIZE; i <= BOARD_SIZE; i++) {
        const pos1 = { x: from.x + i, y: from.y + i };
        const pos2 = { x: from.x + i, y: from.y - i };
        if (isWithinBoard(pos1) && i !== 0) moves.push(pos1);
        if (isWithinBoard(pos2) && i !== 0) moves.push(pos2);
      }
      break;
      
    case 'knight':
      // L-shaped moves
      const knightMoves = [
        { x: 2, y: 1 }, { x: 2, y: -1 },
        { x: -2, y: 1 }, { x: -2, y: -1 },
        { x: 1, y: 2 }, { x: 1, y: -2 },
        { x: -1, y: 2 }, { x: -1, y: -2 }
      ];
      for (const move of knightMoves) {
        const newPos = {
          x: from.x + move.x,
          y: from.y + move.y
        };
        if (isWithinBoard(newPos)) moves.push(newPos);
      }
      break;
      
    case 'queen':
      // Combine rook and bishop moves
      const rookMoves = getPieceMovements({ ...piece, type: 'rook' }, from);
      const bishopMoves = getPieceMovements({ ...piece, type: 'bishop' }, from);
      moves.push(...rookMoves, ...bishopMoves);
      break;
      
    case 'king':
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

export const AVAILABLE_PIECES: GamePiece[] = [
  { id: 'rook-blue', type: 'rook', color: 'blue', points: 50, multiplier: 1.2 },
  { id: 'bishop-green', type: 'bishop', color: 'green', points: 30, multiplier: 1.5 },
  { id: 'knight-purple', type: 'knight', color: 'purple', points: 40, multiplier: 1.3 },
  { id: 'queen-red', type: 'queen', color: 'red', points: 90, multiplier: 2.0 },
];
