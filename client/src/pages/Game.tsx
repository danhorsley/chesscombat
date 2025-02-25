// Example of how to integrate the piece selection into a Game component
import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Board } from "@/components/game/Board";
import { Sidebar } from "@/components/game/Sidebar";
import { generateBoard } from "@/lib/board-generator";
import { selectRandomPieces } from "@/lib/piece-selector";
import {
  GamePiece,
  BoardPosition,
  calculateChainScore,
  validateCaptureChain,
} from "@/lib/game-logic";

export function Game() {
  // Game state
  const [boardConfig, setBoardConfig] = useState(generateBoard("medium"));
  const [availablePieces, setAvailablePieces] = useState<GamePiece[]>([]);
  const [pieces, setPieces] = useState<Map<string, GamePiece>>(new Map());
  const [captureChain, setCaptureChain] = useState<BoardPosition[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [usedPieces, setUsedPieces] = useState<string[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<
    { piece: GamePiece; position: BoardPosition } | undefined
  >();
  const [potentialPoints, setPotentialPoints] = useState(0);
  const [multiplierText, setMultiplierText] = useState("");

  // Initialize game with a new board and random pieces
  useEffect(() => {
    const newBoard = generateBoard("medium");
    setBoardConfig(newBoard);

    // Select random pieces for this puzzle
    const randomPieces = selectRandomPieces(newBoard);
    setAvailablePieces(randomPieces);

    // Reset game state
    setPieces(new Map());
    setCaptureChain([]);
    setScore(0);
    setCombo(0);
    setUsedPieces([]);
    setSelectedPiece(undefined);
    setPotentialPoints(0);
    setMultiplierText("");
  }, []);

  // Handler for dropping a piece on the board
  const handlePieceDrop = (piece: GamePiece, position: BoardPosition) => {
    // Check if this piece is already used
    if (usedPieces.includes(piece.id)) {
      return;
    }

    // Clone the current pieces map
    const newPieces = new Map(pieces);
    const posKey = `${position.x},${position.y}`;

    // If there's already a piece at this position, return
    if (newPieces.has(posKey)) {
      return;
    }

    // Add the piece to the board
    newPieces.set(posKey, piece);
    setPieces(newPieces);

    // Update the used pieces
    setUsedPieces([...usedPieces, piece.id]);

    // Update the capture chain
    const newCaptureChain = [...captureChain, position];
    setCaptureChain(newCaptureChain);

    // Check if this piece can capture the king
    const canCaptureKing = validateCaptureChain(
      newPieces,
      newCaptureChain,
      boardConfig.blackKingPosition,
    );

    // Calculate score for the current chain
    const { points, multiplierText } = calculateChainScore(
      newPieces,
      newCaptureChain,
    );

    if (canCaptureKing) {
      // Chain is complete! Update score and reset
      setScore(score + points);
      setCombo(combo + 1);
      setPotentialPoints(0);
      setMultiplierText("");

      // Show a success message or animation
      // ...
    } else {
      // Just update potential points
      setPotentialPoints(points);
      setMultiplierText(multiplierText);
    }
  };

  // Handler for clicking a square on the board
  const handleSquareClick = (position: BoardPosition) => {
    const posKey = `${position.x},${position.y}`;
    const piece = pieces.get(posKey);

    if (piece) {
      setSelectedPiece({ piece, position });
    } else {
      setSelectedPiece(undefined);
    }
  };

  // Generate new board
  const handleNewGame = () => {
    const newBoard = generateBoard("medium");
    setBoardConfig(newBoard);

    // Select random pieces for this puzzle
    const randomPieces = selectRandomPieces(newBoard);
    setAvailablePieces(randomPieces);

    // Reset game state
    setPieces(new Map());
    setCaptureChain([]);
    setScore(0);
    setCombo(0);
    setUsedPieces([]);
    setSelectedPiece(undefined);
    setPotentialPoints(0);
    setMultiplierText("");
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex gap-4 p-4">
        <div>
          <Board
            pieces={pieces}
            blackKingPosition={boardConfig.blackKingPosition}
            missingSquares={boardConfig.missingSquares}
            startingSquare={boardConfig.startingSquare}
            onPieceDrop={handlePieceDrop}
            selectedPiece={selectedPiece}
            onSquareClick={handleSquareClick}
            captureChain={captureChain}
          />
          <div className="mt-4 flex justify-between">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={handleNewGame}
            >
              New Game
            </button>
          </div>
        </div>
        <Sidebar
          score={score}
          combo={combo}
          usedPieces={usedPieces}
          availablePieces={availablePieces}
          potentialPoints={potentialPoints}
          multiplierText={multiplierText}
        />
      </div>
    </DndProvider>
  );
}
