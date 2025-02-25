// board-save.ts
import { BoardPosition, GamePiece } from "./game-logic";
import { BoardConfig } from "./board-generator";

export interface BoardSave {
  boardConfig: BoardConfig;
  selectedPieces: string[]; // Array of piece IDs
  captureChain: BoardPosition[];
  score: number;
  timestamp: number;
  name: string;
}

export function saveBoardWithPieces(
  boardConfig: BoardConfig,
  pieces: Map<string, GamePiece>,
  captureChain: BoardPosition[],
  score: number,
  name: string = `Board ${new Date().toLocaleString()}`,
): BoardSave {
  // Get the IDs of all placed pieces
  const selectedPieces = Array.from(pieces.values()).map((piece) => piece.id);

  // Create the save object
  const boardSave: BoardSave = {
    boardConfig,
    selectedPieces,
    captureChain,
    score,
    timestamp: Date.now(),
    name,
  };

  return boardSave;
}

export function loadBoardSave(
  save: BoardSave,
  allPieces: GamePiece[],
): {
  boardConfig: BoardConfig;
  pieces: Map<string, GamePiece>;
  captureChain: BoardPosition[];
} {
  const pieces = new Map<string, GamePiece>();

  // Need to convert from saved piece IDs to actual GamePiece objects
  // and position them according to the capture chain
  save.captureChain.forEach((position, index) => {
    if (index < save.selectedPieces.length) {
      const pieceId = save.selectedPieces[index];
      const piece = allPieces.find((p) => p.id === pieceId);

      if (piece) {
        const key = `${position.x},${position.y}`;
        pieces.set(key, piece);
      }
    }
  });

  return {
    boardConfig: save.boardConfig,
    pieces,
    captureChain: save.captureChain,
  };
}
