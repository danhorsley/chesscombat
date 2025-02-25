// Updated Game.tsx
import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { GameLayout } from "./GameLayout";
import {
  GamePiece,
  BoardPosition,
  AVAILABLE_PIECES,
  validateCaptureChain,
  calculateChainScore,
} from "@/lib/game-logic";
import { generateBoard } from "@/lib/board-generator";

export function Game() {
  // State declarations
  const [boardConfig, setBoardConfig] = useState(generateBoard("medium"));
  const [pieces, setPieces] = useState<Map<string, GamePiece>>(new Map());
  const [selectedPiece, setSelectedPiece] = useState<
    | {
        piece: GamePiece;
        position: BoardPosition;
      }
    | undefined
  >(undefined);
  const [captureChain, setCaptureChain] = useState<BoardPosition[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [potentialPoints, setPotentialPoints] = useState(0);
  const [multiplierText, setMultiplierText] = useState("");
  // New state to track if king can be captured
  const [canCaptureKing, setCanCaptureKing] = useState(false);

  // Get list of used piece IDs for tracking available pieces
  const usedPieceIds = Array.from(pieces.values()).map((piece) => piece.id);

  // Handle piece drop on board
  const handlePieceDrop = (piece: GamePiece, position: BoardPosition) => {
    const newPieces = new Map(pieces);
    const key = `${position.x},${position.y}`;
    newPieces.set(key, piece);
    setPieces(newPieces);

    // Update capture chain
    const newCaptureChain = [...captureChain, position];
    setCaptureChain(newCaptureChain);

    // Calculate potential points for this chain
    const { points, multiplierText } = calculateChainScore(
      newPieces,
      newCaptureChain,
    );
    setPotentialPoints(points);
    setMultiplierText(multiplierText);

    // Check if we can capture the king
    const kingCanBeCaptured = validateCaptureChain(
      newPieces,
      newCaptureChain,
      boardConfig.blackKingPosition,
    );

    // Set the state to indicate if king can be captured
    setCanCaptureKing(kingCanBeCaptured);
  };

  // Handle square click for selecting pieces or capturing king
  const handleSquareClick = (position: BoardPosition) => {
    // Check if this is the king's position and if the king can be captured
    if (
      canCaptureKing &&
      position.x === boardConfig.blackKingPosition.x &&
      position.y === boardConfig.blackKingPosition.y
    ) {
      // Complete the capture!
      setScore((prevScore) => prevScore + potentialPoints);
      setCombo((prevCombo) => prevCombo + 1);

      // Reset board for next round
      resetBoard();
      return;
    }

    // Normal piece selection logic
    const key = `${position.x},${position.y}`;
    const piece = pieces.get(key);

    if (piece) {
      setSelectedPiece({ piece, position });
    } else {
      setSelectedPiece(undefined);
    }
  };

  // Reset the board
  const resetBoard = () => {
    setPieces(new Map());
    setCaptureChain([]);
    setSelectedPiece(undefined);
    setPotentialPoints(0);
    setMultiplierText("");
    setCanCaptureKing(false);
    setBoardConfig(generateBoard("medium"));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4">
        <GameLayout
          pieces={pieces}
          blackKingPosition={boardConfig.blackKingPosition}
          missingSquares={boardConfig.missingSquares}
          startingSquare={boardConfig.startingSquare}
          onPieceDrop={handlePieceDrop}
          selectedPiece={selectedPiece}
          onSquareClick={handleSquareClick}
          captureChain={captureChain}
          score={score}
          combo={combo}
          usedPieces={usedPieceIds}
          availablePieces={AVAILABLE_PIECES}
          potentialPoints={potentialPoints}
          multiplierText={multiplierText}
          canCaptureKing={canCaptureKing}
        />

        {/* Add any additional game controls here */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={resetBoard}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Reset Board
          </button>
        </div>
      </div>
    </DndProvider>
  );
}
