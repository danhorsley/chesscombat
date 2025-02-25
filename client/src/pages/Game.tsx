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
  const [selectedPiece, setSelectedPiece] = useState<{
    piece: GamePiece;
    position: BoardPosition;
  } | undefined>(undefined);
  const [captureChain, setCaptureChain] = useState<BoardPosition[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [potentialPoints, setPotentialPoints] = useState(0);
  const [multiplierText, setMultiplierText] = useState("");

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
      newCaptureChain
    );
    setPotentialPoints(points);
    setMultiplierText(multiplierText);

    // Check if we've captured the king
    if (
      validateCaptureChain(
        newPieces,
        [...newCaptureChain, boardConfig.blackKingPosition],
        boardConfig.blackKingPosition
      )
    ) {
      // Successful capture!
      setScore((prevScore) => prevScore + points);
      setCombo((prevCombo) => prevCombo + 1);

      // Reset board for next round
      resetBoard();
    }
  };

  // Handle square click for selecting pieces
  const handleSquareClick = (position: BoardPosition) => {
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