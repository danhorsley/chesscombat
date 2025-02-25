// Updated Game.tsx
import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { GameLayout } from "./GameLayout";
import {
  GamePiece,
  BoardPosition,
  validateCaptureChain,
  calculateChainScore,
} from "@/lib/game-logic";
import { generateBoard } from "@/lib/board-generator";
import { selectPieces } from "@/lib/piece-selector-service";
import { LevelSelector } from "@/components/game/LevelSelector";

export function Game() {
  // Game difficulty state
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium",
  );

  // Level selection for piece sets
  const [currentLevelId, setCurrentLevelId] = useState<string | undefined>(
    undefined,
  );

  // Board configuration state
  const [boardConfig, setBoardConfig] = useState(generateBoard(difficulty));

  // Available pieces based on level selection
  const [availablePieces, setAvailablePieces] = useState<GamePiece[]>([]);

  // State declarations
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
  const [canCaptureKing, setCanCaptureKing] = useState(false);

  // Initialize available pieces when level or board changes
  useEffect(() => {
    // Select pieces based on current level ID or random
    const selectedPieces = selectPieces(boardConfig, currentLevelId);
    setAvailablePieces(selectedPieces);
  }, [boardConfig, currentLevelId]);

  // Get list of used piece IDs for tracking available pieces
  const usedPieceIds = Array.from(pieces.values()).map((piece) => piece.id);

  // Handle level change
  const handleLevelChange = (levelId?: string) => {
    setCurrentLevelId(levelId);
  };

  // Handle difficulty change
  const handleDifficultyChange = (
    newDifficulty: "easy" | "medium" | "hard",
  ) => {
    setDifficulty(newDifficulty);
    resetBoard(newDifficulty);
  };

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
  const resetBoard = (newDifficulty?: "easy" | "medium" | "hard") => {
    setPieces(new Map());
    setCaptureChain([]);
    setSelectedPiece(undefined);
    setPotentialPoints(0);
    setMultiplierText("");
    setCanCaptureKing(false);
    setBoardConfig(generateBoard(newDifficulty || difficulty));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4">
        {/* Add LevelSelector component */}
        <div className="mb-4 max-w-6xl mx-auto">
          <LevelSelector
            currentLevelId={currentLevelId}
            currentDifficulty={difficulty}
            onLevelChange={handleLevelChange}
            onDifficultyChange={handleDifficultyChange}
          />
        </div>

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
          availablePieces={availablePieces}
          potentialPoints={potentialPoints}
          multiplierText={multiplierText}
          canCaptureKing={canCaptureKing}
        />

        {/* Game controls */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => resetBoard()}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Reset Board
          </button>
        </div>
      </div>
    </DndProvider>
  );
}
