import { Board } from "@/components/game/Board";
import { PiecesSidebar } from "@/components/game/PiecesSidebar";
import { ScoreDisplay } from "@/components/game/ScoreDisplay";
import { GamePiece, BoardPosition } from "@/lib/game-logic";

interface GameLayoutProps {
  pieces: Map<string, GamePiece>;
  blackKingPosition: BoardPosition;
  missingSquares: BoardPosition[];
  startingSquare: BoardPosition;
  onPieceDrop: (piece: GamePiece, position: BoardPosition) => void;
  selectedPiece?: { piece: GamePiece; position: BoardPosition };
  onSquareClick: (position: BoardPosition) => void;
  captureChain: BoardPosition[];
  score: number;
  combo: number;
  usedPieces: string[];
  availablePieces: GamePiece[];
  potentialPoints?: number;
  multiplierText?: string;
}

export function GameLayout({
  pieces,
  blackKingPosition,
  missingSquares,
  startingSquare,
  onPieceDrop,
  selectedPiece,
  onSquareClick,
  captureChain,
  score,
  combo,
  usedPieces,
  availablePieces,
  potentialPoints = 0,
  multiplierText = "",
}: GameLayoutProps) {
  return (
    <div className="flex flex-col gap-4 max-w-6xl mx-auto">
      <div className="flex gap-4">
        {/* Board on the left */}
        <div>
          <Board
            pieces={pieces}
            blackKingPosition={blackKingPosition}
            missingSquares={missingSquares}
            startingSquare={startingSquare}
            onPieceDrop={onPieceDrop}
            selectedPiece={selectedPiece}
            onSquareClick={onSquareClick}
            captureChain={captureChain}
          />
        </div>

        {/* Pieces sidebar on the right */}
        <div className="w-64">
          <PiecesSidebar
            usedPieces={usedPieces}
            availablePieces={availablePieces}
          />
        </div>
      </div>

      {/* Score display below the board */}
      <div>
        <ScoreDisplay
          score={score}
          combo={combo}
          potentialPoints={potentialPoints}
          multiplierText={multiplierText}
        />
      </div>
    </div>
  );
}
